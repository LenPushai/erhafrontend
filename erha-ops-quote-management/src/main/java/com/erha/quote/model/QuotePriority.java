package com.erha.quote.model;

/**
 * ðŸŽ¯ Quote Priority Enumeration
 * Business priority classification for quote processing
 */
public enum QuotePriority {
    LOW("Low Priority"),
    NORMAL("Normal Priority"),
    HIGH("High Priority"),
    URGENT("Urgent - Rush Quote"),
    CRITICAL("Critical - Immediate Attention");
    
    private final String description;
    
    QuotePriority(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
