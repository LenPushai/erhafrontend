package com.erha.quote.model;

/**
 * Quote Status Enumeration
 * Enhanced for ERHA OPS Quality & Safety Workflow
 */
public enum QuoteStatus {
    DRAFT("Draft - Being prepared"),
    PENDING_REVIEW("Pending Technical Review"),
    PENDING_QUALITY_REVIEW("Pending Quality Assessment"),
    PENDING_SAFETY_REVIEW("Pending Safety Assessment"),
    PENDING_APPROVAL("Pending Management Approval"),
    APPROVED("Approved - Ready to Send"),
    SENT("Sent to Client"),
    SENT_TO_CLIENT("Sent to Client"), // ADDED THIS MISSING VALUE
    VIEWED("Viewed by Client"),
    UNDER_NEGOTIATION("Under Negotiation"),
    ACCEPTED("Accepted by Client"),
    REJECTED("Rejected by Client"),
    EXPIRED("Expired"),
    CONVERTED_TO_CONTRACT("Converted to Contract"),
    CANCELLED("Cancelled");

    private final String description;

    QuoteStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isEditable() {
        return this == DRAFT || this == PENDING_REVIEW || this == PENDING_QUALITY_REVIEW;
    }

    public boolean requiresApproval() {
        return this == PENDING_REVIEW || this == PENDING_QUALITY_REVIEW || 
               this == PENDING_SAFETY_REVIEW || this == PENDING_APPROVAL;
    }

    public boolean isFinal() {
        return this == ACCEPTED || this == REJECTED || this == EXPIRED || 
               this == CONVERTED_TO_CONTRACT || this == CANCELLED;
    }
}
