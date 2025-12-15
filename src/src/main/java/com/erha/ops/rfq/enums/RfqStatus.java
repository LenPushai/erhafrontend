package com.erha.ops.rfq.enums;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * RFQ Status Enum - BRD v17.0 Enhanced
 * Maps to VARCHAR column in database via @Enumerated(EnumType.STRING)
 */
public enum RfqStatus {

    DRAFT("Draft", "Initial draft, not yet submitted"),
    SUBMITTED("Submitted", "Submitted for review"),
    UNDER_REVIEW("Under Review", "Currently being reviewed"),
    QUALITY_ASSESSMENT("Quality Assessment", "Undergoing quality assessment"),
    SAFETY_ASSESSMENT("Safety Assessment", "Undergoing safety assessment"),
    PENDING_CLARIFICATION("Pending Clarification", "Awaiting clarification from requester"),
    READY_FOR_QUOTE("Ready for Quote", "Approved and ready for quotation"),
    QUOTED("Quoted", "Quotes received from suppliers"),
    INVOICED("Invoiced", "Invoice has been generated"),
    COMPLETED("Completed", "RFQ process completed successfully"),
    CONVERTED("Converted", "Converted to Purchase Order"),
    DECLINED("Declined", "RFQ has been declined"),
    EXPIRED("Expired", "RFQ has expired"),
    ON_HOLD("On Hold", "RFQ is temporarily on hold"),
    CANCELLED("Cancelled", "RFQ has been cancelled");

    private final String displayName;
    private final String description;

    RfqStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    @JsonValue
    @Override
    public String toString() {
        return this.displayName;
    }

    // Business logic methods for BRD v17.0
    public boolean isActive() {
        return this != COMPLETED && this != CANCELLED && this != DECLINED && this != EXPIRED;
    }

    public boolean canBeConverted() {
        return this == READY_FOR_QUOTE || this == QUOTED;
    }

    public boolean isAssessable() {
        return this == SUBMITTED || this == UNDER_REVIEW;
    }

    public boolean requiresApproval() {
        return this == SUBMITTED || this == UNDER_REVIEW || this == QUALITY_ASSESSMENT || this == SAFETY_ASSESSMENT;
    }
}