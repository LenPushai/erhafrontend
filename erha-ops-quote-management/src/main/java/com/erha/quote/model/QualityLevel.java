package com.erha.quote.model;

/**
 * ðŸ† Quality Level Enumeration
 * Quality standards classification for quotes
 */
public enum QualityLevel {
    BASIC("Basic Quality Standards"),
    STANDARD("Standard Quality Requirements"),
    PREMIUM("Premium Quality Assurance"),
    ISO_9001("ISO 9001 Certified Quality"),
    AEROSPACE("Aerospace Grade Quality"),
    MEDICAL("Medical Device Quality");
    
    private final String description;
    
    QualityLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
