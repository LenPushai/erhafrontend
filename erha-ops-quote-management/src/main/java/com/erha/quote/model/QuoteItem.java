package com.erha.quote.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ðŸ“‹ Quote Item Entity - Individual line items within quotes
 * Detailed breakdown of quote components
 */
@Entity
@Table(name = "quote_items")
@EntityListeners(AuditingEntityListener.class)
public class QuoteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    private Quote quote;
    
    @Column(nullable = false)
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCategory category;
    
    @Column(nullable = false)
    @Positive(message = "Quantity must be positive")
    private Integer quantity = 1;
    
    @Column(nullable = false, length = 10)
    @NotBlank(message = "Unit is required")
    private String unit = "EA";
    
    @Column(nullable = false, precision = 12, scale = 2)
    @DecimalMin(value = "0.0", message = "Unit price must be positive")
    private BigDecimal unitPrice = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Total price must be positive")
    private BigDecimal totalPrice = BigDecimal.ZERO;
    
    // ðŸ† QUALITY & MATERIAL SPECS
    private String materialSpecification;
    private String qualityStandard;
    
    @Column(nullable = false)
    private Boolean qualityInspectionRequired = false;
    
    @Column(nullable = false)
    private Boolean safetyEquipmentRequired = false;
    
    // ðŸ“… TIMELINE
    private Integer leadTimeDays;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // ðŸ“ˆ BUSINESS METHODS
    public void calculateTotalPrice() {
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    // ðŸŽ¯ GETTERS AND SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Quote getQuote() { return quote; }
    public void setQuote(Quote quote) { this.quote = quote; }
    
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ItemCategory getCategory() { return category; }
    public void setCategory(ItemCategory category) { this.category = category; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public String getMaterialSpecification() { return materialSpecification; }
    public void setMaterialSpecification(String materialSpecification) { this.materialSpecification = materialSpecification; }
    
    public String getQualityStandard() { return qualityStandard; }
    public void setQualityStandard(String qualityStandard) { this.qualityStandard = qualityStandard; }
    
    public Boolean getQualityInspectionRequired() { return qualityInspectionRequired; }
    public void setQualityInspectionRequired(Boolean qualityInspectionRequired) { this.qualityInspectionRequired = qualityInspectionRequired; }
    
    public Boolean getSafetyEquipmentRequired() { return safetyEquipmentRequired; }
    public void setSafetyEquipmentRequired(Boolean safetyEquipmentRequired) { this.safetyEquipmentRequired = safetyEquipmentRequired; }
    
    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
