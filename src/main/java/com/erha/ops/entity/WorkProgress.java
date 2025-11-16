package com.erha.ops.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_progress")
@Data
public class WorkProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long progressId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "progress_date", nullable = false)
    private LocalDate progressDate;

    @Column(name = "previous_status", length = 50)
    private String previousStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (progressDate == null) {
            progressDate = LocalDate.now();
        }
    }
}