package com.erha.ops.service;

import com.erha.ops.entity.Quote;
import com.erha.ops.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DocuSignWebhookService {

    @Autowired
    private QuoteRepository quoteRepository;

    /**
     * Handle DocuSign webhook notification
     */
    public void handleWebhook(String envelopeId, String status, String recipientId) {
        
        // Find quote by envelope ID
        Quote quote = quoteRepository.findByDocusignEnvelopeId(envelopeId)
            .orElseThrow(() -> new RuntimeException("Quote not found for envelope: " + envelopeId));
        
        // Update quote based on status and recipient
        if ("completed".equalsIgnoreCase(status)) {
            if ("1".equals(recipientId)) {
                // Manager signed
                quote.setManagerSignedDate(LocalDateTime.now());
                quote.setQuoteStatus(Quote.QuoteStatus.UNDER_REVIEW);
            } else if ("2".equals(recipientId)) {
                // Client signed - quote fully executed
                quote.setClientSignedDate(LocalDateTime.now());
                quote.setQuoteStatus(Quote.QuoteStatus.ACCEPTED);
            }
            
            quoteRepository.save(quote);
        }
    }
}
