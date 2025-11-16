package com.erha.ops.service;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiClient;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.client.auth.OAuth;
import com.docusign.esign.model.*;
import com.erha.ops.config.DocuSignConfig;
import com.erha.ops.entity.Quote;
import com.erha.ops.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;

@Service
public class DocuSignService {

    @Autowired
    private DocuSignConfig docuSignConfig;

    @Autowired
    private QuoteRepository quoteRepository;

    private ApiClient apiClient;

    private void initializeApiClient() throws ApiException, IOException {
        if (apiClient == null) {
            apiClient = new ApiClient(docuSignConfig.getBasePath());
            
            // Read private key from file
            ClassPathResource resource = new ClassPathResource("docusign_private.key");
            Reader reader = new InputStreamReader(resource.getInputStream());
            String privateKeyContent = FileCopyUtils.copyToString(reader);
            byte[] privateKeyBytes = privateKeyContent.getBytes();
            
            OAuth.OAuthToken oAuthToken = apiClient.requestJWTUserToken(
                docuSignConfig.getIntegrationKey(),
                docuSignConfig.getUserId(),
                Arrays.asList(OAuth.Scope_SIGNATURE, OAuth.Scope_IMPERSONATION),
                privateKeyBytes,
                3600
            );
            
            apiClient.setAccessToken(oAuthToken.getAccessToken(), oAuthToken.getExpiresIn());
        }
    }

    public String sendQuoteForSignature(
            Long quoteId,
            String managerEmail,
            String managerName,
            String clientEmail,
            String clientName
    ) throws ApiException, IOException {
        
        initializeApiClient();
        
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteId));
        
        EnvelopeDefinition envelopeDefinition = new EnvelopeDefinition();
        envelopeDefinition.setEmailSubject("ERHA Quote " + quote.getQuoteNumber() + " - Signature Required");
        envelopeDefinition.setStatus("sent");
        
        Document document = new Document();
        document.setDocumentBase64(createQuotePdfBase64(quote));
        document.setName("Quote_" + quote.getQuoteNumber() + ".pdf");
        document.setFileExtension("pdf");
        document.setDocumentId("1");
        envelopeDefinition.setDocuments(Arrays.asList(document));
        
        Recipients recipients = new Recipients();
        
        Signer managerSigner = new Signer();
        managerSigner.setEmail(managerEmail);
        managerSigner.setName(managerName);
        managerSigner.setRecipientId("1");
        managerSigner.setRoutingOrder("1");
        
        SignHere managerSignTab = new SignHere();
        managerSignTab.setDocumentId("1");
        managerSignTab.setPageNumber("1");
        managerSignTab.setXPosition("100");
        managerSignTab.setYPosition("150");
        
        Tabs managerTabs = new Tabs();
        managerTabs.setSignHereTabs(Arrays.asList(managerSignTab));
        managerSigner.setTabs(managerTabs);
        
        Signer clientSigner = new Signer();
        clientSigner.setEmail(clientEmail);
        clientSigner.setName(clientName);
        clientSigner.setRecipientId("2");
        clientSigner.setRoutingOrder("2");
        
        SignHere clientSignTab = new SignHere();
        clientSignTab.setDocumentId("1");
        clientSignTab.setPageNumber("1");
        clientSignTab.setXPosition("100");
        clientSignTab.setYPosition("250");
        
        Tabs clientTabs = new Tabs();
        clientTabs.setSignHereTabs(Arrays.asList(clientSignTab));
        clientSigner.setTabs(clientTabs);
        
        recipients.setSigners(Arrays.asList(managerSigner, clientSigner));
        envelopeDefinition.setRecipients(recipients);
        
        EnvelopesApi envelopesApi = new EnvelopesApi(apiClient);
        EnvelopeSummary envelopeSummary = envelopesApi.createEnvelope(
            docuSignConfig.getAccountId(),
            envelopeDefinition
        );
        
        String envelopeId = envelopeSummary.getEnvelopeId();
        
        quote.setDocusignEnvelopeId(envelopeId);
        quote.setSentForSignatureDate(LocalDateTime.now());
        quote.setQuoteStatus(Quote.QuoteStatus.PENDING_APPROVAL);
        quoteRepository.save(quote);
        
        return envelopeId;
    }
    
    private String createQuotePdfBase64(Quote quote) {
        String quoteText = String.format(
            "ERHA FABRICATION & CONSTRUCTION\n\n" +
            "QUOTE: %s\n" +
            "Date: %s\n\n" +
            "Value (Excl VAT): R %.2f\n" +
            "Value (Incl VAT): R %.2f\n\n" +
            "Manager Signature: ___________________\n\n\n" +
            "Client Signature: ___________________\n",
            quote.getQuoteNumber(),
            quote.getQuoteDate(),
            quote.getValueExclVat(),
            quote.getValueInclVat()
        );
        
        return Base64.getEncoder().encodeToString(quoteText.getBytes());
    }
    
    public String getEnvelopeStatus(String envelopeId) throws ApiException, IOException {
        initializeApiClient();
        
        EnvelopesApi envelopesApi = new EnvelopesApi(apiClient);
        Envelope envelope = envelopesApi.getEnvelope(
            docuSignConfig.getAccountId(),
            envelopeId
        );
        
        return envelope.getStatus();
    }
}
