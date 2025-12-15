package com.erha.ops.rfq.enums;

/**
 * Safety Risk Level Enumeration
 * ENHANCED: Aligns with ERHA's zero-incident safety culture
 */
public enum SafetyRiskLevel {
    LOW("Low Risk", 1, "Standard safety protocols apply", "#28a745"),
    MEDIUM("Medium Risk", 2, "Enhanced safety measures required", "#ffc107"),
    HIGH("High Risk", 3, "Specialized safety protocols needed", "#fd7e14"),
    CRITICAL("Critical Risk", 4, "Maximum safety controls required", "#dc3545"),
    EXTREME("Extreme Risk", 5, "Requires executive safety approval", "#6f42c1");
    
    private final String displayName;
    private final int level;
    private final String description;
    private final String colorCode;
    
    SafetyRiskLevel(String displayName, int level, String description, String colorCode) {
        this.displayName = displayName;
        this.level = level;
        this.description = description;
        this.colorCode = colorCode;
    }
    
    public String getDisplayName() { return displayName; }
    public int getLevel() { return level; }
    public String getDescription() { return description; }
    public String getColorCode() { return colorCode; }
    
    public boolean requiresSpecialApproval() { return level >= 4; }
    public boolean requiresHazardAssessment() { return level >= 3; }
}
