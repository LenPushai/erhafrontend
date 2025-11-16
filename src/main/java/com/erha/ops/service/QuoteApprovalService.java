package com.erha.ops.service;

import com.erha.ops.dto.ApprovalPinResponse;
import com.erha.ops.dto.ApprovePinRequest;
import com.erha.ops.entity.Quote;
import com.erha.ops.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class QuoteApprovalService {

    @Autowired
    private QuoteRepository quoteRepository;

    /**
     * Generate a 6-digit PIN for quote approval
     */
    public ApprovalPinResponse generateApprovalPin(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));

        // Check if quote is in valid state for approval
        if (quote.getQuoteStatus() != Quote.QuoteStatus.DRAFT && quote.getQuoteStatus() != Quote.QuoteStatus.NEEDS_REVISION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Quote must be in DRAFT or NEEDS_REVISION status to submit for approval");
        }

        // Generate random 6-digit PIN
        String pin = String.format("%06d", new Random().nextInt(1000000));

        // Set expiry time (24 hours from now)
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        // Update quote with PIN details
        quote.setApprovalPin(pin);
        quote.setPinGeneratedAt(LocalDateTime.now());
        quote.setPinExpiresAt(expiresAt);
        quote.setPinUsedAt(null);
        quote.setQuoteStatus(Quote.QuoteStatus.PENDING_APPROVAL);

        quoteRepository.save(quote);

        return new ApprovalPinResponse(pin, expiresAt, quote.getQuoteNumber(), quote.getQuoteId());
    }

    /**
     * Approve quote using PIN
     */
    public Quote approveWithPin(ApprovePinRequest request) {
        Quote quote = quoteRepository.findByQuoteNumber(request.getQuoteNumber())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Quote not found with number: " + request.getQuoteNumber()));

        if (quote.getApprovalPin() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No approval PIN found for this quote. Please request approval first.");
        }

        if (!quote.getApprovalPin().equals(request.getPin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid PIN");
        }

        if (LocalDateTime.now().isAfter(quote.getPinExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.GONE, 
                "PIN has expired. Please request a new approval PIN.");
        }

        if (quote.getPinUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "PIN has already been used. This quote was approved on " + quote.getApprovedDate());
        }

        quote.setQuoteStatus(Quote.QuoteStatus.APPROVED);
        quote.setPinUsedAt(LocalDateTime.now());
        quote.setApprovedDate(LocalDateTime.now());
        quote.setApprovedBy("MANAGER");

        quoteRepository.save(quote);

        return quote;
    }

    /**
     * Check PIN status for a quote
     */
    public String checkPinStatus(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));

        if (quote.getApprovalPin() == null) {
            return "NO_PIN";
        }

        if (quote.getPinUsedAt() != null) {
            return "USED";
        }

        if (LocalDateTime.now().isAfter(quote.getPinExpiresAt())) {
            return "EXPIRED";
        }

        return "ACTIVE";
    }
}