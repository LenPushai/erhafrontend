package com.erhaops.rfq.enums;

/**
 * RFQ Status Enumeration
 * Tracks the lifecycle of an RFQ with safety and quality gates
 */
public enum RFQStatus {
    DRAFT("Draft", "RFQ is being prepared"),
    SUBMITTED("Submitted", "RFQ submitted and awaiting review"),
    UNDER_REVIEW("Under Review", "RFQ is being evaluated"),
    QUALITY_ASSESSMENT("Quality Assessment", "Quality requirements being evaluated"),
    SAFETY_ASSESSMENT("Safety Assessment", "Safety risks being assessed"),
    PENDING_CLARIFICATION("Pending Clarification", "Waiting for client clarification"),
    READY_FOR_QUOTE("Ready for Quote", "Ready to convert to quote"),
    CONVERTED("Converted", "Successfully converted to quote"),
    DECLINED("Declined", "RFQ declined or not pursued"),
    EXPIRED("Expired", "RFQ response deadline passed"),
    ON_HOLD("On Hold", "RFQ temporarily suspended"),
    CANCELLED("Cancelled", "RFQ cancelled by client");
    
    private final String displayName;
    private final String description;
    
    RFQStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isActive() {
        return this != CONVERTED && this != DECLINED && 
               this != EXPIRED && this != CANCELLED;
    }
    
    public boolean canBeConverted() {
        return this == READY_FOR_QUOTE;
    }
}
