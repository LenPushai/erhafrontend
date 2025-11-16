package com.erha.ops.repository;

import com.erha.ops.entity.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkProgressRepository extends JpaRepository<WorkProgress, Long> {
    
    // Find all progress entries for a specific job
    List<WorkProgress> findByJobId(Long jobId);
    
    // Find progress entries by job ID ordered by date (most recent first)
    List<WorkProgress> findByJobIdOrderByProgressDateDesc(Long jobId);
    
    // Find progress entries by updated user
    List<WorkProgress> findByUpdatedBy(String updatedBy);
    
    // Find progress entries by date range
    List<WorkProgress> findByProgressDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find progress entries by new status
    List<WorkProgress> findByNewStatus(String newStatus);
    
    // Find progress entries by job and date range
    @Query("SELECT wp FROM WorkProgress wp WHERE wp.jobId = :jobId AND wp.progressDate BETWEEN :startDate AND :endDate ORDER BY wp.progressDate DESC")
    List<WorkProgress> findByJobIdAndDateRange(@Param("jobId") Long jobId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Get latest progress entry for a job
    @Query("SELECT wp FROM WorkProgress wp WHERE wp.jobId = :jobId ORDER BY wp.progressDate DESC, wp.createdDate DESC")
    List<WorkProgress> findLatestByJobId(@Param("jobId") Long jobId);
    
    // Count progress entries for a job
    long countByJobId(Long jobId);
    
    // Find progress entries with specific status change
    @Query("SELECT wp FROM WorkProgress wp WHERE wp.jobId = :jobId AND wp.newStatus = :status ORDER BY wp.progressDate DESC")
    List<WorkProgress> findByJobIdAndStatus(@Param("jobId") Long jobId, @Param("status") String status);
}