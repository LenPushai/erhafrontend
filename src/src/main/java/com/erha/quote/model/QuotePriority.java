package com.erha.quote.model;

/**
 * Quote Priority Enumeration
 * Enhanced with Risk-based Priority Levels
 */
public enum QuotePriority {
    LOW("Low Priority", 1),
    MEDIUM("Medium Priority", 2),
    HIGH("High Priority", 3),
    URGENT("Urgent", 4),
    CRITICAL("Critical - Safety Risk", 5);

    private final String description;
    private final int level;

    QuotePriority(String description, int level) {
        this.description = description;
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public int getLevel() {
        return level;
    }

    public boolean isHigherThan(QuotePriority other) {
        return this.level > other.level;
    }

    public static QuotePriority fromLevel(int level) {
        for (QuotePriority priority : values()) {
            if (priority.level == level) {
                return priority;
            }
        }
        return MEDIUM;
    }
}
