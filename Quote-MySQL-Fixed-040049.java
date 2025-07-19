// ================================================================
// MYSQL-COMPATIBLE QUOTE ENTITY - EMERGENCY FIX
// Replace existing Quote.java with this version
// ================================================================
package com.erha.quote.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quotes")
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Quote number is required")
    @Column(unique = true, length = 50)
    private String quoteNumber;

    @NotBlank(message = "Client name is required")
    @Column(length = 255)
    private String clientName;

    @Email(message = "Valid email is required")
    @Column(length = 255)
    private String clientEmail;

    @NotBlank(message = "Project description is required")
    @Column(length = 2000)
    private String projectDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuoteStatus status = QuoteStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    private QuoteQualityLevel qualityLevel = QuoteQualityLevel.STANDARD;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal qualityCost = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal safetyCost = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal riskFactor = BigDecimal.ONE;

    @Column(nullable = false)
    private Boolean iso9001Required = false;

    // Use TEXT for JSON data instead of JSONB
    @Column(columnDefinition = "TEXT")
    private String qualityRequirements;

    @Column(columnDefinition = "TEXT")
    private String safetyConsiderations;

    @Column(columnDefinition = "TEXT")
    private String complianceNotes;

    @Column(columnDefinition = "TEXT")
    private String riskAssessment;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime validUntil;

    @NotBlank
    @Column(length = 100)
    private String createdBy;

    @Column(length = 100)
    private String approvedBy;

    // Constructors
    public Quote() {}

    public Quote(String quoteNumber, String clientName, String clientEmail, 
                String projectDescription, String createdBy) {
        this.quoteNumber = quoteNumber;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.projectDescription = projectDescription;
        this.createdBy = createdBy;
        this.validUntil = LocalDateTime.now().plusDays(30);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }

    public QuoteQualityLevel getQualityLevel() { return qualityLevel; }
    public void setQualityLevel(QuoteQualityLevel qualityLevel) { this.qualityLevel = qualityLevel; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getQualityCost() { return qualityCost; }
    public void setQualityCost(BigDecimal qualityCost) { this.qualityCost = qualityCost; }

    public BigDecimal getSafetyCost() { return safetyCost; }
    public void setSafetyCost(BigDecimal safetyCost) { this.safetyCost = safetyCost; }

    public BigDecimal getRiskFactor() { return riskFactor; }
    public void setRiskFactor(BigDecimal riskFactor) { this.riskFactor = riskFactor; }

    public Boolean getIso9001Required() { return iso9001Required; }
    public void setIso9001Required(Boolean iso9001Required) { this.iso9001Required = iso9001Required; }

    public String getQualityRequirements() { return qualityRequirements; }
    public void setQualityRequirements(String qualityRequirements) { this.qualityRequirements = qualityRequirements; }

    public String getSafetyConsiderations() { return safetyConsiderations; }
    public void setSafetyConsiderations(String safetyConsiderations) { this.safetyConsiderations = safetyConsiderations; }

    public String getComplianceNotes() { return complianceNotes; }
    public void setComplianceNotes(String complianceNotes) { this.complianceNotes = complianceNotes; }

    public String getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Quote{" +
                "id=" + id +
                ", quoteNumber='" + quoteNumber + '\'' +
                ", clientName='" + clientName + '\'' +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                '}';
    }
}

// QuoteQualityLevel enum
enum QuoteQualityLevel {
    STANDARD, ENHANCED, PREMIUM
}
