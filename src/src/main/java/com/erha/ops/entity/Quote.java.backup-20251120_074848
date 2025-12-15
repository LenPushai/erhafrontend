package com.erha.ops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotes")
@Data
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quote_id")  // ? CRITICAL FIX: Added this line!
    private Long quoteId;

    @Column(name = "quote_number", unique = true, nullable = false, length = 50)
    private String quoteNumber;

    @Column(name = "rfq_id")
    private Long rfqId;

    @Column(name = "job_id")  // ? NEW: Added for job linking
    private Long jobId;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "quote_date")
    private LocalDate quoteDate;

    @Column(name = "valid_until_date")
    private LocalDate validUntilDate;

    @Column(name = "value_excl_vat", precision = 15, scale = 2)
    private BigDecimal valueExclVat;

    @Column(name = "value_incl_vat", precision = 15, scale = 2)
    private BigDecimal valueInclVat;
    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "vat_amount", precision = 15, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "grand_total", precision = 15, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "client_name", length = 255)
    private String client;

    @Enumerated(EnumType.STRING)
    @Column(name = "quote_status", length = 50, columnDefinition = "VARCHAR(50) COLLATE utf8mb4_0900_as_cs")
    private QuoteStatus quoteStatus;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    
    // DocuSign Integration Fields
    @Column(name = "docusign_envelope_id", length = 100)
    private String docusignEnvelopeId;

    @Column(name = "sent_for_signature_date")
    private LocalDateTime sentForSignatureDate;

    @Column(name = "manager_signed_date")
    private LocalDateTime managerSignedDate;

    @Column(name = "client_signed_date")
    private LocalDateTime clientSignedDate;

    @Column(name = "signed_document_path", length = 500)
    private String signedDocumentPath;

    @Column(name = "certificate_path", length = 500)
    private String certificatePath;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        if (quoteDate == null) {
            quoteDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    // QuoteStatus Enum
    public enum QuoteStatus {
        DRAFT,          // Quote is being prepared
        SUBMITTED,      // Quote has been submitted for approval/review
        SENT,           // Quote has been sent to client
        UNDER_REVIEW,   // Client is reviewing the quote
        ACCEPTED,       // Client accepted the quote
        REJECTED,       // Client rejected the quote
        EXPIRED,        // Quote validity period has expired
        WITHDRAWN,      // Quote was withdrawn
        SUPERSEDED,     // Replaced by a newer quote version
        PENDING_APPROVAL, // Awaiting manager approval
        APPROVED,       // Manager approved quote
        NEEDS_REVISION  // Manager requested changes
    }

    // PIN Approval Fields
    @Column(name = "approval_pin", length = 6)
    private String approvalPin;

    @Column(name = "pin_generated_at")
    private LocalDateTime pinGeneratedAt;

    @Column(name = "pin_expires_at")
    private LocalDateTime pinExpiresAt;

    @Column(name = "pin_used_at")
    private LocalDateTime pinUsedAt;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    // PIN Approval Getters and Setters
    public String getApprovalPin() {
        return approvalPin;
    }

    public void setApprovalPin(String approvalPin) {
        this.approvalPin = approvalPin;
    }

    public LocalDateTime getPinGeneratedAt() {
        return pinGeneratedAt;
    }

    public void setPinGeneratedAt(LocalDateTime pinGeneratedAt) {
        this.pinGeneratedAt = pinGeneratedAt;
    }

    public LocalDateTime getPinExpiresAt() {
        return pinExpiresAt;
    }

    public void setPinExpiresAt(LocalDateTime pinExpiresAt) {
        this.pinExpiresAt = pinExpiresAt;
    }

    public LocalDateTime getPinUsedAt() {
        return pinUsedAt;
    }

    public void setPinUsedAt(LocalDateTime pinUsedAt) {
        this.pinUsedAt = pinUsedAt;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(LocalDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }
}



