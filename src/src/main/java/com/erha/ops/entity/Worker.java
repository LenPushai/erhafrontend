package com.erha.ops.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workers")
public class Worker {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BIGINT")
    private Long id;
    
    @Column(name = "employee_code", unique = true, length = 50)
    private String employeeCode;
    
    @Column(name = "clock_no", unique = true, length = 50)
    private String clockNo;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "id_number", length = 20)
    private String idNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "worker_type", nullable = false)
    private WorkerType workerType = WorkerType.CASUAL;
    
    @Column(name = "department", length = 100)
    private String department;
    
    @Column(name = "role", length = 100)
    private String role;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WorkerStatus status = WorkerStatus.ACTIVE;
    
    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;
    
    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;
    
    @Column(name = "hire_date")
    private LocalDate hireDate;
    
    @Column(name = "termination_date")
    private LocalDate terminationDate;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "current_hourly_rate", precision = 10, scale = 2)
    private BigDecimal currentHourlyRate;
    
    @Column(name = "last_sage_sync")
    private LocalDateTime lastSageSync;
    
    @Column(name = "last_jarison_sync")
    private LocalDateTime lastJarisonSync;
    
    @Column(name = "created_by", columnDefinition = "BINARY(16)")
    private byte[] createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum WorkerType {
        PERMANENT, CASUAL
    }
    
    public enum WorkerStatus {
        ACTIVE, INACTIVE, TERMINATED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Worker() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    
    public String getClockNo() { return clockNo; }
    public void setClockNo(String clockNo) { this.clockNo = clockNo; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    
    public WorkerType getWorkerType() { return workerType; }
    public void setWorkerType(WorkerType workerType) { this.workerType = workerType; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public WorkerStatus getStatus() { return status; }
    public void setStatus(WorkerStatus status) { this.status = status; }
    
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    
    public LocalDate getTerminationDate() { return terminationDate; }
    public void setTerminationDate(LocalDate terminationDate) { this.terminationDate = terminationDate; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public BigDecimal getCurrentHourlyRate() { return currentHourlyRate; }
    public void setCurrentHourlyRate(BigDecimal currentHourlyRate) { this.currentHourlyRate = currentHourlyRate; }
    
    public LocalDateTime getLastSageSync() { return lastSageSync; }
    public void setLastSageSync(LocalDateTime lastSageSync) { this.lastSageSync = lastSageSync; }
    
    public LocalDateTime getLastJarisonSync() { return lastJarisonSync; }
    public void setLastJarisonSync(LocalDateTime lastJarisonSync) { this.lastJarisonSync = lastJarisonSync; }
    
    public byte[] getCreatedBy() { return createdBy; }
    public void setCreatedBy(byte[] createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}