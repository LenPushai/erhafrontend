package com.erha.quote.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Quote Entity - Enhanced for ERHA OPS v7.0
 * Includes Quality Cost Integration & Safety Assessment
 */
@Entity
@Table(name = "quotes", indexes = {
    @Index(name = "idx_quote_status", columnList = "status"),
    @Index(name = "idx_quote_client", columnList = "client_id"),
    @Index(name = "idx_quote_number", columnList = "quote_number"),
    @Index(name = "idx_quote_risk_score", columnList = "risk_score")
})
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "quote_number", unique = true, nullable = false, length = 50)
    @NotBlank(message = "Quote number is required")
    private String quoteNumber;

    @Column(name = "rfq_id")
    private UUID rfqId;

    @Column(name = "client_id", nullable = false)
    @NotNull(message = "Client ID is required")
    private UUID clientId;

    @Column(name = "created_by", nullable = false)
    @NotNull(message = "Created by user ID is required")
    private UUID createdBy;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    // Basic Quote Information
    @Column(name = "title", nullable = false, length = 200)
    @NotBlank(message = "Quote title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private QuoteStatus status = QuoteStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private QuotePriority priority = QuotePriority.MEDIUM;

    // Financial Information
    @Column(name = "subtotal", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Subtotal cannot be negative")
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Tax amount cannot be negative")
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    @DecimalMin(value = "0.01", message = "Total amount must be greater than zero")
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    @Column(name = "currency", length = 3)
    private String currency = "ZAR";

    // Enhanced Quality & Safety Fields
    @Column(name = "quality_cost", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Quality cost cannot be negative")
    private BigDecimal qualityCost = BigDecimal.ZERO;

    @Column(name = "safety_cost", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Safety cost cannot be negative")
    private BigDecimal safetyCost = BigDecimal.ZERO;

    @Column(name = "compliance_cost", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Compliance cost cannot be negative")
    private BigDecimal complianceCost = BigDecimal.ZERO;

    @Column(name = "quality_requirements", columnDefinition = "jsonb")
    private String qualityRequirements; // JSON string

    @Column(name = "safety_assessment", columnDefinition = "jsonb")
    private String safetyAssessment; // JSON string

    @Column(name = "risk_score")
    @Min(value = 0, message = "Risk score cannot be negative")
    @Max(value = 100, message = "Risk score cannot exceed 100")
    private Integer riskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality_level", length = 20)
    private QualityLevel qualityLevel = QualityLevel.STANDARD;

    // Timeline
    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "delivery_days")
    @Min(value = 1, message = "Delivery days must be at least 1")
    private Integer deliveryDays;

    @Column(name = "estimated_start")
    private LocalDateTime estimatedStart;

    @Column(name = "estimated_completion")
    private LocalDateTime estimatedCompletion;

    // Approval Workflow
    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @Column(name = "quality_reviewed_by")
    private UUID qualityReviewedBy;

    @Column(name = "quality_reviewed_at")
    private LocalDateTime qualityReviewedAt;

    @Column(name = "quality_notes", columnDefinition = "TEXT")
    private String qualityNotes;

    // Client Communication
    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "client_feedback", columnDefinition = "TEXT")
    private String clientFeedback;

    @Column(name = "revision_history", columnDefinition = "jsonb")
    private String revisionHistory; // JSON string

    // Terms & Conditions
    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;

    @Column(name = "delivery_terms", columnDefinition = "TEXT")
    private String deliveryTerms;

    @Column(name = "warranty_terms", columnDefinition = "TEXT")
    private String warrantyTerms;

    // Metadata
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata; // JSON string

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Relationships
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuoteItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuoteApproval> approvals = new ArrayList<>();

    // Quality Level Enum
    public enum QualityLevel {
        STANDARD, ENHANCED, PREMIUM
    }

    // Constructors
    public Quote() {}

    public Quote(String quoteNumber, UUID clientId, UUID createdBy, String title, BigDecimal totalAmount) {
        this.quoteNumber = quoteNumber;
        this.clientId = clientId;
        this.createdBy = createdBy;
        this.title = title;
        this.totalAmount = totalAmount;
    }

    // Additional constructor for backward compatibility
    public Quote(String title, String description, BigDecimal totalAmount) {
        this.title = title;
        this.description = description;
        this.totalAmount = totalAmount;
        // Generate a temporary quote number
        this.quoteNumber = "TEMP-" + System.currentTimeMillis();
    }

    // Business Methods - THESE WERE MISSING
    public BigDecimal calculateTotal() {
        BigDecimal itemsTotal = items.stream()
            .map(QuoteItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal qualityAndSafetyTotal = getTotalQualityAndSafetyCost();
        BigDecimal subtotalCalc = itemsTotal.add(qualityAndSafetyTotal);
        
        this.subtotal = subtotalCalc;
        this.totalAmount = subtotalCalc.add(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        
        return this.totalAmount;
    }

    public void approve(String approverNotes) {
        this.status = QuoteStatus.APPROVED;
        this.approvedAt = LocalDateTime.now();
        this.approvalNotes = approverNotes;
    }

    public void sendToClient() {
        if (this.status == QuoteStatus.APPROVED) {
            this.status = QuoteStatus.SENT;
            this.sentAt = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Quote must be approved before sending to client");
        }
    }

    public void markAsViewed() {
        if (this.status == QuoteStatus.SENT) {
            this.viewedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters (keeping all existing ones and adding new ones)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }

    public UUID getRfqId() { return rfqId; }
    public void setRfqId(UUID rfqId) { this.rfqId = rfqId; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }

    public QuotePriority getPriority() { return priority; }
    public void setPriority(QuotePriority priority) { this.priority = priority; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getQualityCost() { return qualityCost; }
    public void setQualityCost(BigDecimal qualityCost) { this.qualityCost = qualityCost; }

    public BigDecimal getSafetyCost() { return safetyCost; }
    public void setSafetyCost(BigDecimal safetyCost) { this.safetyCost = safetyCost; }

    public BigDecimal getComplianceCost() { return complianceCost; }
    public void setComplianceCost(BigDecimal complianceCost) { this.complianceCost = complianceCost; }

    public String getQualityRequirements() { return qualityRequirements; }
    public void setQualityRequirements(String qualityRequirements) { this.qualityRequirements = qualityRequirements; }

    public String getSafetyAssessment() { return safetyAssessment; }
    public void setSafetyAssessment(String safetyAssessment) { this.safetyAssessment = safetyAssessment; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public QualityLevel getQualityLevel() { return qualityLevel; }
    public void setQualityLevel(QualityLevel qualityLevel) { this.qualityLevel = qualityLevel; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public Integer getDeliveryDays() { return deliveryDays; }
    public void setDeliveryDays(Integer deliveryDays) { this.deliveryDays = deliveryDays; }

    public LocalDateTime getEstimatedStart() { return estimatedStart; }
    public void setEstimatedStart(LocalDateTime estimatedStart) { this.estimatedStart = estimatedStart; }

    public LocalDateTime getEstimatedCompletion() { return estimatedCompletion; }
    public void setEstimatedCompletion(LocalDateTime estimatedCompletion) { this.estimatedCompletion = estimatedCompletion; }

    public UUID getApprovedBy() { return approvedBy; }
    public void setApprovedBy(UUID approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovalNotes() { return approvalNotes; }
    public void setApprovalNotes(String approvalNotes) { this.approvalNotes = approvalNotes; }

    public UUID getQualityReviewedBy() { return qualityReviewedBy; }
    public void setQualityReviewedBy(UUID qualityReviewedBy) { this.qualityReviewedBy = qualityReviewedBy; }

    public LocalDateTime getQualityReviewedAt() { return qualityReviewedAt; }
    public void setQualityReviewedAt(LocalDateTime qualityReviewedAt) { this.qualityReviewedAt = qualityReviewedAt; }

    public String getQualityNotes() { return qualityNotes; }
    public void setQualityNotes(String qualityNotes) { this.qualityNotes = qualityNotes; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }

    public String getClientFeedback() { return clientFeedback; }
    public void setClientFeedback(String clientFeedback) { this.clientFeedback = clientFeedback; }

    public String getRevisionHistory() { return revisionHistory; }
    public void setRevisionHistory(String revisionHistory) { this.revisionHistory = revisionHistory; }

    public String getTermsConditions() { return termsConditions; }
    public void setTermsConditions(String termsConditions) { this.termsConditions = termsConditions; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getDeliveryTerms() { return deliveryTerms; }
    public void setDeliveryTerms(String deliveryTerms) { this.deliveryTerms = deliveryTerms; }

    public String getWarrantyTerms() { return warrantyTerms; }
    public void setWarrantyTerms(String warrantyTerms) { this.warrantyTerms = warrantyTerms; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public List<QuoteItem> getItems() { return items; }
    public void setItems(List<QuoteItem> items) { this.items = items; }

    public List<QuoteApproval> getApprovals() { return approvals; }
    public void setApprovals(List<QuoteApproval> approvals) { this.approvals = approvals; }

    // Helper methods
    public boolean isEditable() {
        return status != null && status.isEditable() && deletedAt == null;
    }

    public boolean requiresApproval() {
        return status != null && status.requiresApproval();
    }

    public boolean isFinal() {
        return status != null && status.isFinal();
    }

    public BigDecimal getTotalQualityAndSafetyCost() {
        BigDecimal total = BigDecimal.ZERO;
        if (qualityCost != null) total = total.add(qualityCost);
        if (safetyCost != null) total = total.add(safetyCost);
        if (complianceCost != null) total = total.add(complianceCost);
        return total;
    }

    public void addItem(QuoteItem item) {
        items.add(item);
        item.setQuote(this);
    }

    public void removeItem(QuoteItem item) {
        items.remove(item);
        item.setQuote(null);
    }

    @Override
    public String toString() {
        return "Quote{" +
                "id=" + id +
                ", quoteNumber='" + quoteNumber + '\'' +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", currency='" + currency + '\'' +
                ", riskScore=" + riskScore +
                '}';
    }
}
