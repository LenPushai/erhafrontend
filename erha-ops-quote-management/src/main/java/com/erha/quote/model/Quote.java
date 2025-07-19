package com.erha.quote.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ðŸ’° Quote Entity - Professional Quote Management
 * Enhanced with quality assurance costing and safety consideration assessment
 */
@Entity
@Table(name = "quotes")
@EntityListeners(AuditingEntityListener.class)
public class Quote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    @NotBlank(message = "Quote number is required")
    private String quoteNumber;
    
    @Column(nullable = false)
    @NotNull(message = "RFQ ID is required")
    private Long rfqId;
    
    @Column(nullable = false)
    @NotBlank(message = "Client name is required")
    private String clientName;
    
    @Column(nullable = false)
    @NotBlank(message = "Project title is required")
    private String projectTitle;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuoteStatus status = QuoteStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotePriority priority = QuotePriority.NORMAL;
    
    // ðŸ’° PRICING STRUCTURE
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Base amount must be positive")
    private BigDecimal baseAmount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Quality cost must be positive")
    private BigDecimal qualityCost = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Safety cost must be positive")
    private BigDecimal safetyCost = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Material cost must be positive")
    private BigDecimal materialCost = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Labor cost must be positive")
    private BigDecimal laborCost = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Markup percentage must be positive")
    @DecimalMax(value = "100.0", message = "Markup percentage cannot exceed 100%")
    private BigDecimal markupPercentage = BigDecimal.valueOf(15.0);
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Total amount must be positive")
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    // ðŸ“… TIMELINE MANAGEMENT
    @Column(nullable = false)
    @Future(message = "Valid until date must be in the future")
    private LocalDateTime validUntil;
    
    @Column(nullable = false)
    @Positive(message = "Estimated duration must be positive")
    private Integer estimatedDurationDays;
    
    private LocalDateTime estimatedStartDate;
    private LocalDateTime estimatedCompletionDate;
    
    // ðŸ† QUALITY & SAFETY INTEGRATION
    @Column(columnDefinition = "TEXT")
    private String qualityRequirements;
    
    @Column(columnDefinition = "TEXT")
    private String safetyConsiderations;
    
    @Enumerated(EnumType.STRING)
    private QualityLevel requiredQualityLevel = QualityLevel.STANDARD;
    
    @Column(nullable = false)
    private Boolean iso9001Required = false;
    
    @Enumerated(EnumType.STRING)
    private RiskLevel riskAssessment = RiskLevel.LOW;
    
    // ðŸ‘¤ TEAM & APPROVAL
    @Column(nullable = false)
    @NotBlank(message = "Created by is required")
    private String createdBy;
    
    private String approvedBy;
    private LocalDateTime approvedAt;
    
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String internalNotes;
    
    @Column(columnDefinition = "TEXT")
    private String clientNotes;
    
    // ðŸ“Š METADATA
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    private String contactEmail;
    private String contactPhone;
    
    // ðŸ”— RELATIONSHIPS
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuoteItem> items = new ArrayList<>();
    
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuoteDocument> documents = new ArrayList<>();
    
    // ðŸ“ˆ BUSINESS METHODS
    public void calculateTotalAmount() {
        BigDecimal subtotal = baseAmount
            .add(qualityCost)
            .add(safetyCost)
            .add(materialCost)
            .add(laborCost);
        
        BigDecimal markup = subtotal.multiply(markupPercentage.divide(BigDecimal.valueOf(100)));
        this.totalAmount = subtotal.add(markup);
    }
    
    public void approve(String approver) {
        this.status = QuoteStatus.APPROVED;
        this.approvedBy = approver;
        this.approvedAt = LocalDateTime.now();
    }
    
    public void reject(String reviewer, String reason) {
        this.status = QuoteStatus.REJECTED;
        this.reviewedBy = reviewer;
        this.reviewedAt = LocalDateTime.now();
        this.internalNotes = reason;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validUntil);
    }
    
    public boolean canBeModified() {
        return status == QuoteStatus.DRAFT || status == QuoteStatus.UNDER_REVIEW;
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
    
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
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
    
    public List<QuoteItem> getItems() { return items; }
    public void setItems(List<QuoteItem> items) { this.items = items; }
    
    public List<QuoteDocument> getDocuments() { return documents; }
    public void setDocuments(List<QuoteDocument> documents) { this.documents = documents; }
}
