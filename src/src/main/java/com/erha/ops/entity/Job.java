package com.erha.ops.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "job_number", unique = true, nullable = false, length = 50)
    private String jobNumber;

    @Column(name = "rfq_id")
    private Long rfqId;

    @Column(name = "quote_id")
    private Long quoteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType = JobType.NORMAL;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private JobLocation location = JobLocation.SHOP;

    @Column(name = "client_id")
    private Long clientId;

    private String department;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "order_number", length = 100)
    private String orderNumber;

    @Column(name = "order_received_date")
    private LocalDate orderReceivedDate;

    @Column(name = "order_value_excl", precision = 15, scale = 2)
    private BigDecimal orderValueExcl;

    @Column(name = "order_value_incl", precision = 15, scale = 2)
    private BigDecimal orderValueIncl;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.NEW;

    @Enumerated(EnumType.STRING)
    private JobPriority priority = JobPriority.MEDIUM;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "last_modified_by", length = 100)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        lastModifiedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedDate = LocalDateTime.now();
    }

    // Enums
    public enum JobType {
        NORMAL, SHUTDOWN, CONTRACT, INTERNAL
    }

    public enum JobLocation {
        SHOP, SITE, BOTH
    }

    public enum JobStatus {
        NEW, IN_PROGRESS, QUALITY_CHECK, READY, DELIVERED, INVOICED, COMPLETE
    }

    public enum JobPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    // All getters and setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobNumber() { return jobNumber; }
    public void setJobNumber(String jobNumber) { this.jobNumber = jobNumber; }
    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    public Long getQuoteId() { return quoteId; }
    public void setQuoteId(Long quoteId) { this.quoteId = quoteId; }
    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JobLocation getLocation() { return location; }
    public void setLocation(JobLocation location) { this.location = location; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public LocalDate getOrderReceivedDate() { return orderReceivedDate; }
    public void setOrderReceivedDate(LocalDate orderReceivedDate) { this.orderReceivedDate = orderReceivedDate; }
    public BigDecimal getOrderValueExcl() { return orderValueExcl; }
    public void setOrderValueExcl(BigDecimal orderValueExcl) { this.orderValueExcl = orderValueExcl; }
    public BigDecimal getOrderValueIncl() { return orderValueIncl; }
    public void setOrderValueIncl(BigDecimal orderValueIncl) { this.orderValueIncl = orderValueIncl; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public JobPriority getPriority() { return priority; }
    public void setPriority(JobPriority priority) { this.priority = priority; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public LocalDateTime getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
}
