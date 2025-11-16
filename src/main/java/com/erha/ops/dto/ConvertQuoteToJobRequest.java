package com.erha.ops.dto;

import com.erha.ops.entity.Job;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ConvertQuoteToJobRequest {
    
    @NotNull(message = "Quote ID is required")
    private Long quoteId;
    
    @NotNull(message = "Client ID is required")
    private Long clientId;
    
    @NotNull(message = "Order number is required")
    private String orderNumber;
    
    @NotNull(message = "Order received date is required")
    private LocalDate orderReceivedDate;
    
    private String description;
    private Job.JobType jobType = Job.JobType.NORMAL;
    private Job.JobLocation location = Job.JobLocation.SHOP;
    private Job.JobPriority priority = Job.JobPriority.MEDIUM;
    private String department;
    
    @NotNull(message = "Expected delivery date is required")
    private LocalDate expectedDeliveryDate;
    
    private String remarks;
    private String createdBy;

    // Getters and Setters
    public Long getQuoteId() { return quoteId; }
    public void setQuoteId(Long quoteId) { this.quoteId = quoteId; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDate getOrderReceivedDate() { return orderReceivedDate; }
    public void setOrderReceivedDate(LocalDate orderReceivedDate) { 
        this.orderReceivedDate = orderReceivedDate; 
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Job.JobType getJobType() { return jobType; }
    public void setJobType(Job.JobType jobType) { this.jobType = jobType; }

    public Job.JobLocation getLocation() { return location; }
    public void setLocation(Job.JobLocation location) { this.location = location; }

    public Job.JobPriority getPriority() { return priority; }
    public void setPriority(Job.JobPriority priority) { this.priority = priority; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { 
        this.expectedDeliveryDate = expectedDeliveryDate; 
    }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
