package com.erha.ops.rfq.enums;

/**
 * RFQ Priority Enumeration
 * Determines urgency and resource allocation
 */
public enum RFQPriority {
    LOW("Low", 1, "Standard processing time"),
    MEDIUM("Medium", 2, "Normal priority"),
    HIGH("High", 3, "Expedited processing required"),
    URGENT("Urgent", 4, "Immediate attention required"),
    CRITICAL("Critical", 5, "Critical business impact");
    
    private final String displayName;
    private final int level;
    private final String description;
    
    RFQPriority(String displayName, int level, String description) {
        this.displayName = displayName;
        this.level = level;
        this.description = description;
    }
    
    public String getDisplayName() { return displayName; }
    public int getLevel() { return level; }
    public String getDescription() { return description; }
}
