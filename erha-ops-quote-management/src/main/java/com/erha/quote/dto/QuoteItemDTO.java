package com.erha.quote.dto;

import com.erha.quote.model.ItemCategory;
import com.erha.quote.model.QuoteItem;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ðŸ“‹ Quote Item Data Transfer Object
 * API request/response object for quote item operations
 */
public class QuoteItemDTO {
    
    private Long id;
    private Long quoteId;
    
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    private String description;
    private ItemCategory category;
    
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotBlank(message = "Unit is required")
    private String unit;
    
    @DecimalMin(value = "0.0", message = "Unit price must be positive")
    private BigDecimal unitPrice;
    
    private BigDecimal totalPrice;
    private String materialSpecification;
    private String qualityStandard;
    private Boolean qualityInspectionRequired;
    private Boolean safetyEquipmentRequired;
    private Integer leadTimeDays;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // ðŸŽ¯ CONSTRUCTORS
    public QuoteItemDTO() {}
    
    public QuoteItemDTO(QuoteItem item) {
        this.id = item.getId();
        this.quoteId = item.getQuote() != null ? item.getQuote().getId() : null;
        this.itemName = item.getItemName();
        this.description = item.getDescription();
        this.category = item.getCategory();
        this.quantity = item.getQuantity();
        this.unit = item.getUnit();
        this.unitPrice = item.getUnitPrice();
        this.totalPrice = item.getTotalPrice();
        this.materialSpecification = item.getMaterialSpecification();
        this.qualityStandard = item.getQualityStandard();
        this.qualityInspectionRequired = item.getQualityInspectionRequired();
        this.safetyEquipmentRequired = item.getSafetyEquipmentRequired();
        this.leadTimeDays = item.getLeadTimeDays();
        this.notes = item.getNotes();
        this.createdAt = item.getCreatedAt();
        this.updatedAt = item.getUpdatedAt();
    }
    
    // ðŸŽ¯ GETTERS AND SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getQuoteId() { return quoteId; }
    public void setQuoteId(Long quoteId) { this.quoteId = quoteId; }
    
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
