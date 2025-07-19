package com.erha.quote.dto;

import com.erha.quote.model.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ðŸ’° Quote Data Transfer Object
 * API request/response object for quote operations
 */
public class QuoteDTO {
    
    private Long id;
    private String quoteNumber;
    
    @NotNull(message = "RFQ ID is required")
    private Long rfqId;
    
    @NotBlank(message = "Client name is required")
    private String clientName;
    
    @NotBlank(message = "Project title is required")
    private String projectTitle;
    
    private String description;
    private QuoteStatus status;
    private QuotePriority priority;
    
    @DecimalMin(value = "0.0", message = "Base amount must be positive")
    private BigDecimal baseAmount;
    
    @DecimalMin(value = "0.0", message = "Quality cost must be positive")
    private BigDecimal qualityCost;
    
    @DecimalMin(value = "0.0", message = "Safety cost must be positive")
    private BigDecimal safetyCost;
    
    @DecimalMin(value = "0.0", message = "Material cost must be positive")
    private BigDecimal materialCost;
    
    @DecimalMin(value = "0.0", message = "Labor cost must be positive")
    private BigDecimal laborCost;
    
    @DecimalMin(value = "0.0", message = "Markup percentage must be positive")
    @DecimalMax(value = "100.0", message = "Markup percentage cannot exceed 100%")
    private BigDecimal markupPercentage;
    
    private BigDecimal totalAmount;
    
    @Future(message = "Valid until date must be in the future")
    private LocalDateTime validUntil;
    
    @Positive(message = "Estimated duration must be positive")
    private Integer estimatedDurationDays;
    
    private LocalDateTime estimatedStartDate;
    private LocalDateTime estimatedCompletionDate;
    private String qualityRequirements;
    private String safetyConsiderations;
    private QualityLevel requiredQualityLevel;
    private Boolean iso9001Required;
    private RiskLevel riskAssessment;
    private String createdBy;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String internalNotes;
    private String clientNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String contactEmail;
    private String contactPhone;
    
    private List<QuoteItemDTO> items;
    private List<QuoteDocumentDTO> documents;
    
    // ðŸŽ¯ CONSTRUCTORS
    public QuoteDTO() {}
    
    public QuoteDTO(Quote quote) {
        this.id = quote.getId();
        this.quoteNumber = quote.getQuoteNumber();
        this.rfqId = quote.getRfqId();
        this.clientName = quote.getClientName();
        this.projectTitle = quote.getProjectTitle();
        this.description = quote.getDescription();
        this.status = quote.getStatus();
        this.priority = quote.getPriority();
        this.baseAmount = quote.getBaseAmount();
        this.qualityCost = quote.getQualityCost();
        this.safetyCost = quote.getSafetyCost();
        this.materialCost = quote.getMaterialCost();
        this.laborCost = quote.getLaborCost();
        this.markupPercentage = quote.getMarkupPercentage();
        this.totalAmount = quote.getTotalAmount();
        this.validUntil = quote.getValidUntil();
        this.estimatedDurationDays = quote.getEstimatedDurationDays();
        this.estimatedStartDate = quote.getEstimatedStartDate();
        this.estimatedCompletionDate = quote.getEstimatedCompletionDate();
        this.qualityRequirements = quote.getQualityRequirements();
        this.safetyConsiderations = quote.getSafetyConsiderations();
        this.requiredQualityLevel = quote.getRequiredQualityLevel();
        this.iso9001Required = quote.getIso9001Required();
        this.riskAssessment = quote.getRiskAssessment();
        this.createdBy = quote.getCreatedBy();
        this.approvedBy = quote.getApprovedBy();
        this.approvedAt = quote.getApprovedAt();
        this.internalNotes = quote.getInternalNotes();
        this.clientNotes = quote.getClientNotes();
        this.createdAt = quote.getCreatedAt();
        this.updatedAt = quote.getUpdatedAt();
        this.contactEmail = quote.getContactEmail();
        this.contactPhone = quote.getContactPhone();
    }
    
    // ðŸŽ¯ GETTERS AND SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }
    
    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    
    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }
    
    public QuotePriority getPriority() { return priority; }
    public void setPriority(QuotePriority priority) { this.priority = priority; }
    
    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
    
    public BigDecimal getQualityCost() { return qualityCost; }
    public void setQualityCost(BigDecimal qualityCost) { this.qualityCost = qualityCost; }
    
    public BigDecimal getSafetyCost() { return safetyCost; }
    public void setSafetyCost(BigDecimal safetyCost) { this.safetyCost = safetyCost; }
    
    public BigDecimal getMaterialCost() { return materialCost; }
    public void setMaterialCost(BigDecimal materialCost) { this.materialCost = materialCost; }
    
    public BigDecimal getLaborCost() { return laborCost; }
    public void setLaborCost(BigDecimal laborCost) { this.laborCost = laborCost; }
    
    public BigDecimal getMarkupPercentage() { return markupPercentage; }
    public void setMarkupPercentage(BigDecimal markupPercentage) { this.markupPercentage = markupPercentage; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
    
    public Integer getEstimatedDurationDays() { return estimatedDurationDays; }
    public void setEstimatedDurationDays(Integer estimatedDurationDays) { this.estimatedDurationDays = estimatedDurationDays; }
    
    public LocalDateTime getEstimatedStartDate() { return estimatedStartDate; }
    public void setEstimatedStartDate(LocalDateTime estimatedStartDate) { this.estimatedStartDate = estimatedStartDate; }
    
    public LocalDateTime getEstimatedCompletionDate() { return estimatedCompletionDate; }
    public void setEstimatedCompletionDate(LocalDateTime estimatedCompletionDate) { this.estimatedCompletionDate = estimatedCompletionDate; }
    
    public String getQualityRequirements() { return qualityRequirements; }
    public void setQualityRequirements(String qualityRequirements) { this.qualityRequirements = qualityRequirements; }
    
    public String getSafetyConsiderations() { return safetyConsiderations; }
    public void setSafetyConsiderations(String safetyConsiderations) { this.safetyConsiderations = safetyConsiderations; }
    
    public QualityLevel getRequiredQualityLevel() { return requiredQualityLevel; }
    public void setRequiredQualityLevel(QualityLevel requiredQualityLevel) { this.requiredQualityLevel = requiredQualityLevel; }
    
    public Boolean getIso9001Required() { return iso9001Required; }
    public void setIso9001Required(Boolean iso9001Required) { this.iso9001Required = iso9001Required; }
    
    public RiskLevel getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(RiskLevel riskAssessment) { this.riskAssessment = riskAssessment; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    
    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
    
    public String getClientNotes() { return clientNotes; }
    public void setClientNotes(String clientNotes) { this.clientNotes = clientNotes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public List<QuoteItemDTO> getItems() { return items; }
    public void setItems(List<QuoteItemDTO> items) { this.items = items; }
    
    public List<QuoteDocumentDTO> getDocuments() { return documents; }
    public void setDocuments(List<QuoteDocumentDTO> documents) { this.documents = documents; }
}
