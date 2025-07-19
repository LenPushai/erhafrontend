package com.erhaops.rfq.enums;

/**
 * RFQ Source Enumeration
 * Tracks where RFQs originate from
 */
public enum RFQSource {
    EMAIL("Email", "Received via email"),
    PHONE("Phone Call", "Received via phone"),
    WEBSITE("Website", "Submitted through website"),
    WALK_IN("Walk-in", "Client visited in person"),
    REFERRAL("Referral", "Referred by existing client"),
    REPEAT_CLIENT("Repeat Client", "Existing client relationship"),
    TENDER("Tender", "Public or private tender"),
    EXHIBITION("Exhibition", "Trade show or exhibition"),
    SOCIAL_MEDIA("Social Media", "Social media inquiry"),
    PARTNER("Partner", "Business partner referral"),
    COLD_OUTREACH("Cold Outreach", "Proactive business development"),
    OTHER("Other", "Other source");
    
    private final String displayName;
    private final String description;
    
    RFQSource(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
