package com.erha.quote.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quote_approvals")
public class QuoteApproval {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    private Quote quote;
    
    @Column(name = "approver_id", nullable = false)
    private UUID approverId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_type", nullable = false)
    private ApprovalType approvalType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public enum ApprovalType {
        TECHNICAL, QUALITY, SAFETY, FINANCIAL, MANAGEMENT
    }
    
    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED, REQUIRES_CHANGES
    }

    // Constructors, getters, setters
    public QuoteApproval() {}
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Quote getQuote() { return quote; }
    public void setQuote(Quote quote) { this.quote = quote; }
    
    public UUID getApproverId() { return approverId; }
    public void setApproverId(UUID approverId) { this.approverId = approverId; }
    
    public ApprovalType getApprovalType() { return approvalType; }
    public void setApprovalType(ApprovalType approvalType) { this.approvalType = approvalType; }
    
    public ApprovalStatus getStatus() { return status; }
    public void setStatus(ApprovalStatus status) { this.status = status; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
