package com.erha.ops.repository;

import com.erha.ops.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    // Find by job number
    Optional<Job> findByJobNumber(String jobNumber);
    
    // Find by status
    List<Job> findByStatus(Job.JobStatus status);
    
    // Find by department
    List<Job> findByDepartment(String department);
    
    // Find by client ID
    List<Job> findByClientId(Long clientId);
    
    // Find by priority
    List<Job> findByPriority(Job.JobPriority priority);
    
    // Find by job type
    List<Job> findByJobType(Job.JobType jobType);
    
    // Find by location
    List<Job> findByLocation(Job.JobLocation location);
    
    // Find overdue jobs
    @Query("SELECT j FROM Job j WHERE j.expectedDeliveryDate < :today AND j.status NOT IN ('COMPLETE', 'DELIVERED', 'INVOICED')")
    List<Job> findOverdueJobs(@Param("today") LocalDate today);
    
    // Search jobs by keyword (searches in job number, description, order number, department)
    @Query("SELECT j FROM Job j WHERE " +
           "LOWER(j.jobNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.department) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Job> searchJobs(@Param("keyword") String keyword);
    
    // Find by RFQ ID
    List<Job> findByRfqId(Long rfqId);
    
    // Find by Quote ID
    List<Job> findByQuoteId(Long quoteId);
    
    // Find by date range
    @Query("SELECT j FROM Job j WHERE j.orderReceivedDate BETWEEN :startDate AND :endDate")
    List<Job> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Count by status
    long countByStatus(Job.JobStatus status);
    
    // Find active jobs (not complete, delivered, or invoiced)
    @Query("SELECT j FROM Job j WHERE j.status NOT IN ('COMPLETE', 'DELIVERED', 'INVOICED')")
    List<Job> findActiveJobs();
    
    // Find jobs by status and priority
    List<Job> findByStatusAndPriority(Job.JobStatus status, Job.JobPriority priority);
    
    // Find recent jobs (created in last N days)
    @Query("SELECT j FROM Job j WHERE j.createdDate >= :sinceDate ORDER BY j.createdDate DESC")
    List<Job> findRecentJobs(@Param("sinceDate") LocalDate sinceDate);
}