package com.erha.quote.model;

/**
 * âš ï¸ Risk Level Enumeration
 * Safety and project risk assessment classification
 */
public enum RiskLevel {
    LOW("Low Risk - Standard Safety"),
    MEDIUM("Medium Risk - Enhanced Safety"),
    HIGH("High Risk - Advanced Safety Protocols"),
    VERY_HIGH("Very High Risk - Maximum Safety"),
    CRITICAL("Critical Risk - Specialized Safety Team");
    
    private final String description;
    
    RiskLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
