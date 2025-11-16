package com.erha.ops.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateProgressRequest {
    
    @NotNull(message = "Progress percentage is required")
    @Min(value = 0, message = "Progress must be at least 0")
    @Max(value = 100, message = "Progress cannot exceed 100")
    private Integer progressPercentage;
    
    private String notes;

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { 
        this.progressPercentage = progressPercentage; 
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
