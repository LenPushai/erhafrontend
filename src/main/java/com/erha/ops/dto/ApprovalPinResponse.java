package com.erha.ops.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for PIN generation
 */
public class ApprovalPinResponse {
    private String pin;
    private LocalDateTime expiresAt;
    private String quoteNumber;
    private Long quoteId;

    public ApprovalPinResponse() {
    }

    public ApprovalPinResponse(String pin, LocalDateTime expiresAt, String quoteNumber, Long quoteId) {
        this.pin = pin;
        this.expiresAt = expiresAt;
        this.quoteNumber = quoteNumber;
        this.quoteId = quoteId;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
    }

    public Long getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(Long quoteId) {
        this.quoteId = quoteId;
    }
}