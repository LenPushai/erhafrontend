package com.erha.quote.model;

/**
 * ðŸ’° Quote Status Enumeration
 * Professional quote lifecycle status tracking
 */
public enum QuoteStatus {
    DRAFT("Draft - Under Preparation"),
    UNDER_REVIEW("Under Review"),
    APPROVED("Approved & Ready"),
    SENT_TO_CLIENT("Sent to Client"),
    CLIENT_REVIEWING("Client Reviewing"),
    ACCEPTED("Accepted by Client"),
    REJECTED("Rejected"),
    EXPIRED("Expired"),
    CONVERTED_TO_CONTRACT("Converted to Contract");
    
    private final String description;
    
    QuoteStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
