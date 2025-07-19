package com.erhaops.rfq.dto.request;

import com.erhaops.rfq.enums.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Create RFQ Request DTO
 * ENHANCED: Includes safety and quality requirements capture
 */
public class CreateRFQRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;
    
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;
    
    @NotBlank(message = "Client name is required")
    @Size(max = 100, message = "Client name cannot exceed 100 characters")
    private String clientName;
    
    @Email(message = "Valid email is required")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String clientEmail;
    
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String clientPhone;
    
    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    private String clientCompany;
    
    @NotNull(message = "Priority is required")
    private RFQPriority priority;
    
    private ProjectType projectType;
    private BigDecimal estimatedValue;
    private String currency = "ZAR";
    private LocalDateTime responseDueDate;
    private LocalDateTime projectStartDate;
    private LocalDateTime projectEndDate;
    
    // ENHANCED: Quality Requirements
    private String qualityRequirements;
    private Boolean isoComplianceRequired = false;
    private String clientQualityStandards;
    private Boolean qualityDocumentationNeeded = false;
    
    // ENHANCED: Safety Considerations
    private SafetyRiskLevel safetyRiskLevel = SafetyRiskLevel.LOW;
    private String safetyRequirements;
    private Boolean hazardAssessmentNeeded = false;
    private Boolean specialSafetyEquipmentNeeded = false;
    private String workshopAreasInvolved;
    
    // Source and Communication
    private RFQSource source = RFQSource.EMAIL;
    private String sourceReference;
    private CommunicationPreference communicationPreference = CommunicationPreference.EMAIL;
    
    // Assignment
    private String assignedToUserId;
    private String assignedToName;
    private String department;
    
    // Metadata
    private String tags;
    private String internalNotes;
    
    // Constructors
    public CreateRFQRequest() {}
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public String getClientEmail() {
        return clientEmail;
    }
    
    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }
    
    public RFQPriority getPriority() {
        return priority;
    }
    
    public void setPriority(RFQPriority priority) {
        this.priority = priority;
    }
    
    public ProjectType getProjectType() {
        return projectType;
    }
    
    public void setProjectType(ProjectType projectType) {
        this.projectType = projectType;
    }
    
    public SafetyRiskLevel getSafetyRiskLevel() {
        return safetyRiskLevel;
    }
    
    public void setSafetyRiskLevel(SafetyRiskLevel safetyRiskLevel) {
        this.safetyRiskLevel = safetyRiskLevel;
    }
    
    public Boolean getIsoComplianceRequired() {
        return isoComplianceRequired;
    }
    
    public void setIsoComplianceRequired(Boolean isoComplianceRequired) {
        this.isoComplianceRequired = isoComplianceRequired;
    }
    
    // Additional getters/setters...
}
