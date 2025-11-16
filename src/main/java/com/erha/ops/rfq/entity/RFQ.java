package com.erha.ops.rfq.entity;

import com.erha.ops.rfq.enums.RfqStatus;
import com.erha.ops.rfq.enums.Priority;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "rfqs", indexes = {
        @Index(name = "idx_rfq_status", columnList = "status"),
        @Index(name = "idx_rfq_job_no", columnList = "job_no"),
        @Index(name = "idx_rfq_client", columnList = "client_id"),
        @Index(name = "idx_rfq_operating_entity", columnList = "operating_entity")
})
public class RFQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_no", unique = true, nullable = false, length = 20)
    private String jobNo;

    // CLIENT INFORMATION
    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "department", length = 100)
    private String department;

    // RFQ DETAILS
    @Column(name = "operating_entity", nullable = false, length = 50)
    private String operatingEntity; // "ERHA FC" or "ERHA SS"

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "request_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate requestDate;

    @Column(name = "required_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate requiredDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "estimated_value", precision = 19, scale = 2)
    private BigDecimal estimatedValue;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    // STATUS AND ASSIGNMENT
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RfqStatus status = RfqStatus.DRAFT;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "assigned_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate assignedDate;

    @Column(name = "follow_up_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate followUpDate;

    // NOTES
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Internal notes

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks; // Client-facing remarks

    // METADATA
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // CONSTRUCTORS
    public RFQ() {}

    public RFQ(String jobNo, Long clientId, String contactPerson, String operatingEntity, 
               String description, LocalDate requestDate, LocalDate requiredDate, Priority priority) {
        this.jobNo = jobNo;
        this.clientId = clientId;
        this.contactPerson = contactPerson;
        this.operatingEntity = operatingEntity;
        this.description = description;
        this.requestDate = requestDate;
        this.requiredDate = requiredDate;
        this.priority = priority;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
        if (status == null) {
            status = RfqStatus.DRAFT;
        }
        if (priority == null) {
            priority = Priority.MEDIUM;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // GETTERS AND SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobNo() { return jobNo; }
    public void setJobNo(String jobNo) { this.jobNo = jobNo; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getOperatingEntity() { return operatingEntity; }
    public void setOperatingEntity(String operatingEntity) { this.operatingEntity = operatingEntity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }

    public LocalDate getRequiredDate() { return requiredDate; }
    public void setRequiredDate(LocalDate requiredDate) { this.requiredDate = requiredDate; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public String getSpecialRequirements() { return specialRequirements; }
    public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }

    public RfqStatus getStatus() { return status; }
    public void setStatus(RfqStatus status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RFQ rfq = (RFQ) o;
        return Objects.equals(id, rfq.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("RFQ{id=%d, jobNo='%s', entity='%s', client=%d, contact='%s', status=%s, priority=%s}",
                id, jobNo, operatingEntity, clientId, contactPerson, status, priority);
    }
}