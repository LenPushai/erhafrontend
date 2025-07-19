package com.erha.quote.model;

/**
 * ðŸ“‹ Item Category Enumeration
 * Classification for quote line items
 */
public enum ItemCategory {
    MATERIAL("Raw Materials"),
    FABRICATION("Fabrication Work"),
    WELDING("Welding Services"),
    MACHINING("Machining Operations"),
    ASSEMBLY("Assembly Work"),
    FINISHING("Finishing & Coating"),
    LABOR("Labor Charges"),
    TRANSPORT("Transportation"),
    SAFETY_EQUIPMENT("Safety Equipment"),
    QUALITY_CONTROL("Quality Control"),
    OVERHEAD("Project Overhead"),
    MISCELLANEOUS("Miscellaneous Items");
    
    private final String description;
    
    ItemCategory(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
