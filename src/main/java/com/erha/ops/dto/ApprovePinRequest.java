package com.erha.ops.dto;

/**
 * Request DTO for approving quote with PIN
 */
public class ApprovePinRequest {
    private String quoteNumber;
    private String pin;

    public ApprovePinRequest() {
    }

    public ApprovePinRequest(String quoteNumber, String pin) {
        this.quoteNumber = quoteNumber;
        this.pin = pin;
    }

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }
}