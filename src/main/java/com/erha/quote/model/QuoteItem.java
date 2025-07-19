package com.erha.quote.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "quote_items")
public class QuoteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    @NotNull
    private Quote quote;
    
    @Column(name = "description", nullable = false)
    @NotNull
    private String description;
    
    @Column(name = "quantity", precision = 10, scale = 3, nullable = false)
    @DecimalMin(value = "0.001")
    @NotNull
    private BigDecimal quantity;
    
    @Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
    @DecimalMin(value = "0.00")
    @NotNull
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", precision = 15, scale = 2, nullable = false)
    @DecimalMin(value = "0.00")
    @NotNull
    private BigDecimal totalPrice;

    // Constructors, getters, setters
    public QuoteItem() {}
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Quote getQuote() { return quote; }
    public void setQuote(Quote quote) { this.quote = quote; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
