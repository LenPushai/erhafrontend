package com.erhaops.rfq.enums;

/**
 * Communication Preference Enumeration
 * Client's preferred communication method
 */
public enum CommunicationPreference {
    EMAIL("Email", "Email communication preferred"),
    PHONE("Phone", "Phone communication preferred"),
    SMS("SMS", "SMS/WhatsApp preferred"),
    VIDEO_CALL("Video Call", "Video conferencing preferred"),
    IN_PERSON("In Person", "Face-to-face meetings preferred"),
    PROJECT_PORTAL("Project Portal", "Client portal communication"),
    MIXED("Mixed", "Multiple communication methods");
    
    private final String displayName;
    private final String description;
    
    CommunicationPreference(String displayName, String description) {
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
