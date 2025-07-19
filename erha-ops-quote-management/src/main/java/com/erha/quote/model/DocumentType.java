package com.erha.quote.model;

/**
 * ðŸ“„ Document Type Enumeration
 * Classification for quote-related documents
 */
public enum DocumentType {
    DRAWING("Technical Drawing"),
    SPECIFICATION("Technical Specification"),
    PHOTO("Reference Photo"),
    CERTIFICATE("Quality Certificate"),
    PROPOSAL("Quote Proposal Document"),
    TERMS("Terms & Conditions"),
    SAFETY_PLAN("Safety Plan"),
    QUALITY_PLAN("Quality Assurance Plan"),
    MATERIAL_LIST("Material List"),
    TIMELINE("Project Timeline"),
    OTHER("Other Document");
    
    private final String description;
    
    DocumentType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
