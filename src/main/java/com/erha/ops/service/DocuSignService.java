package com.erha.ops.service;

import com.docusign.esign.api.*;
import com.docusign.esign.client.ApiClient;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.client.auth.OAuth;
import com.docusign.esign.model.*;
import com.erha.ops.config.DocuSignConfig;
import com.erha.ops.entity.Quote;
import com.erha.ops.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

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
            byte[] privateKeyBytes = Files.readAllBytes(Paths.get(docuSignConfig.getSecretKey()));
            
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

    public String sendQuoteForSignature(Long quoteId, String managerEmail, String managerName, 
                                       String clientEmail, String clientName) throws Exception {
        initializeApiClient();

        // Get quote from database
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new RuntimeException("Quote not found"));

        // Create envelope definition
        EnvelopeDefinition envelopeDefinition = new EnvelopeDefinition();
        envelopeDefinition.setEmailSubject("Please sign quote: " + quote.getQuoteNumber());

        // Add valid PDF document
        Document document = new Document();
        document.setDocumentBase64("JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooRVJIQSBRdW90ZSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G");
        document.setName("Quote_" + quote.getQuoteNumber() + ".pdf");
        document.setFileExtension("pdf");
        document.setDocumentId("1");
        envelopeDefinition.setDocuments(Arrays.asList(document));

        // Add signature tabs for signers
        SignHere managerSignTab = new SignHere();
        managerSignTab.setDocumentId("1");
        managerSignTab.setPageNumber("1");
        managerSignTab.setXPosition("100");
        managerSignTab.setYPosition("100");

        SignHere clientSignTab = new SignHere();
        clientSignTab.setDocumentId("1");
        clientSignTab.setPageNumber("1");
        clientSignTab.setXPosition("100");
        clientSignTab.setYPosition("150");

        // Add manager signer
        Signer managerSigner = new Signer();
        managerSigner.setEmail(managerEmail);
        managerSigner.setName(managerName);
        managerSigner.setRecipientId("1");
        managerSigner.setRoutingOrder("1");
        Tabs managerTabs = new Tabs();
        managerTabs.setSignHereTabs(Arrays.asList(managerSignTab));
        managerSigner.setTabs(managerTabs);

        // Add client signer
        Signer clientSigner = new Signer();
        clientSigner.setEmail(clientEmail);
        clientSigner.setName(clientName);
        clientSigner.setRecipientId("2");
        clientSigner.setRoutingOrder("2");
        Tabs clientTabs = new Tabs();
        clientTabs.setSignHereTabs(Arrays.asList(clientSignTab));
        clientSigner.setTabs(clientTabs);

        Recipients recipients = new Recipients();
        recipients.setSigners(Arrays.asList(managerSigner, clientSigner));
        envelopeDefinition.setRecipients(recipients);

        envelopeDefinition.setStatus("sent");

        // Send envelope
        EnvelopesApi envelopesApi = new EnvelopesApi(apiClient);
        EnvelopeSummary results = envelopesApi.createEnvelope(docuSignConfig.getAccountId(), envelopeDefinition);

        return results.getEnvelopeId();
    }

    public String getEnvelopeStatus(String envelopeId) throws Exception {
        initializeApiClient();
        EnvelopesApi envelopesApi = new EnvelopesApi(apiClient);
        Envelope envelope = envelopesApi.getEnvelope(docuSignConfig.getAccountId(), envelopeId);
        return envelope.getStatus();
    }
}
