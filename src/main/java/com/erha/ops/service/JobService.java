package com.erha.ops.service;

import com.erha.ops.entity.Job;
import com.erha.ops.entity.Quote;
import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.entity.WorkProgress;
import com.erha.ops.repository.JobRepository;
import com.erha.ops.repository.QuoteRepository;
import com.erha.ops.repository.RfqRepository;
import com.erha.ops.repository.WorkProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private WorkProgressRepository workProgressRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private RfqRepository rfqRepository;

    // ============================================
    // BASIC CRUD OPERATIONS
    // ============================================

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public Job createJob(Job job) {
        // Generate job number if not provided
        if (job.getJobNumber() == null || job.getJobNumber().isEmpty()) {
            job.setJobNumber(generateJobNumber());
        }
        
        // Set default status if not provided
        if (job.getStatus() == null) {
            job.setStatus(Job.JobStatus.NEW);
        }
        
        // Set default priority if not provided
        if (job.getPriority() == null) {
            job.setPriority(Job.JobPriority.MEDIUM);
        }
        
        Job savedJob = jobRepository.save(job);
        
        // Create initial progress entry
        createInitialProgress(savedJob);
        
        return savedJob;
    }

    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        // Track status change for progress entry
        Job.JobStatus oldStatus = job.getStatus();
        
        // Update fields
        if (jobDetails.getJobType() != null) {
            job.setJobType(jobDetails.getJobType());
        }
        if (jobDetails.getDescription() != null) {
            job.setDescription(jobDetails.getDescription());
        }
        if (jobDetails.getLocation() != null) {
            job.setLocation(jobDetails.getLocation());
        }
        if (jobDetails.getDepartment() != null) {
            job.setDepartment(jobDetails.getDepartment());
        }
        if (jobDetails.getOrderNumber() != null) {
            job.setOrderNumber(jobDetails.getOrderNumber());
        }
        if (jobDetails.getOrderReceivedDate() != null) {
            job.setOrderReceivedDate(jobDetails.getOrderReceivedDate());
        }
        if (jobDetails.getExpectedDeliveryDate() != null) {
            job.setExpectedDeliveryDate(jobDetails.getExpectedDeliveryDate());
        }
        if (jobDetails.getStatus() != null && !jobDetails.getStatus().equals(oldStatus)) {
            job.setStatus(jobDetails.getStatus());
            // Create progress entry for status change
            createProgressEntry(job, oldStatus, jobDetails.getStatus());
        }
        if (jobDetails.getPriority() != null) {
            job.setPriority(jobDetails.getPriority());
        }

        return jobRepository.save(job);
    }

    public Job updateJobStatus(Long id, Job.JobStatus newStatus) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        Job.JobStatus oldStatus = job.getStatus();
        job.setStatus(newStatus);
        
        // Create progress entry
        createProgressEntry(job, oldStatus, newStatus);
        
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    // ============================================
    // FILTERING & SEARCH
    // ============================================

    public List<Job> getJobsByStatus(Job.JobStatus status) {
        return jobRepository.findByStatus(status);
    }

    public List<Job> getJobsByDepartment(String department) {
        return jobRepository.findByDepartment(department);
    }

    public List<Job> getJobsByClient(Long clientId) {
        return jobRepository.findByClientId(clientId);
    }

    public List<Job> getJobsByPriority(Job.JobPriority priority) {
        return jobRepository.findByPriority(priority);
    }

    public List<Job> getOverdueJobs() {
        LocalDate today = LocalDate.now();
        return jobRepository.findOverdueJobs(today);
    }

    public List<Job> searchJobs(String keyword) {
        return jobRepository.searchJobs(keyword);
    }

    // ============================================
    // WORK PROGRESS OPERATIONS
    // ============================================

    public List<WorkProgress> getJobProgress(Long jobId) {
        return workProgressRepository.findByJobIdOrderByProgressDateDesc(jobId);
    }

    public WorkProgress addJobProgress(Long jobId, WorkProgress progress) {
        // Verify job exists
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        progress.setJobId(jobId);
        
        if (progress.getProgressDate() == null) {
            progress.setProgressDate(LocalDate.now());
        }
        
        // If new status is provided, update job status
        if (progress.getNewStatus() != null) {
            try {
                Job.JobStatus newStatus = Job.JobStatus.valueOf(progress.getNewStatus());
                job.setStatus(newStatus);
                jobRepository.save(job);
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
        
        return workProgressRepository.save(progress);
    }

    public Optional<WorkProgress> getLatestJobProgress(Long jobId) {
        List<WorkProgress> progressList = workProgressRepository.findLatestByJobId(jobId);
        return progressList.isEmpty() ? Optional.empty() : Optional.of(progressList.get(0));
    }

    // ============================================
    // JOB-RFQ-QUOTE INTEGRATION
    // ============================================

    public Optional<RFQ> getJobRfq(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        if (job.getRfqId() == null) {
            return Optional.empty();
        }
        
        return rfqRepository.findById(job.getRfqId());
    }

    public Optional<Quote> getJobQuote(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        if (job.getQuoteId() == null) {
            return Optional.empty();
        }
        
        return quoteRepository.findById(job.getQuoteId());
    }

    public Job linkQuoteToJob(Long jobId, Long quoteId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        // Verify quote exists
        quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found with id: " + quoteId));
        
        job.setQuoteId(quoteId);
        return jobRepository.save(job);
    }

    public Job linkRfqToJob(Long jobId, Long rfqId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        // Verify RFQ exists
        rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found with id: " + rfqId));
        
        job.setRfqId(rfqId);
        return jobRepository.save(job);
    }

    // ============================================
    // STATISTICS
    // ============================================

    public Map<String, Object> getJobStatistics() {
        List<Job> allJobs = jobRepository.findAll();
        LocalDate today = LocalDate.now();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalJobs", allJobs.size());
        stats.put("activeJobs", allJobs.stream()
                .filter(j -> j.getStatus() != Job.JobStatus.COMPLETE && 
                            j.getStatus() != Job.JobStatus.DELIVERED &&
                            j.getStatus() != Job.JobStatus.INVOICED)
                .count());
        stats.put("overdueJobs", allJobs.stream()
                .filter(j -> j.getExpectedDeliveryDate() != null && 
                            j.getExpectedDeliveryDate().isBefore(today) &&
                            j.getStatus() != Job.JobStatus.COMPLETE)
                .count());
        
        // Jobs by status
        Map<String, Long> jobsByStatus = new HashMap<>();
        for (Job.JobStatus status : Job.JobStatus.values()) {
            long count = allJobs.stream().filter(j -> j.getStatus() == status).count();
            jobsByStatus.put(status.toString(), count);
        }
        stats.put("jobsByStatus", jobsByStatus);
        
        // Jobs by priority
        Map<String, Long> jobsByPriority = new HashMap<>();
        for (Job.JobPriority priority : Job.JobPriority.values()) {
            long count = allJobs.stream().filter(j -> j.getPriority() == priority).count();
            jobsByPriority.put(priority.toString(), count);
        }
        stats.put("jobsByPriority", jobsByPriority);
        
        // Jobs by department
        Map<String, Long> jobsByDepartment = allJobs.stream()
                .filter(j -> j.getDepartment() != null)
                .collect(Collectors.groupingBy(Job::getDepartment, Collectors.counting()));
        stats.put("jobsByDepartment", jobsByDepartment);
        
        return stats;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private String generateJobNumber() {
        int year = LocalDate.now().getYear() % 100; // Last 2 digits of year
        long count = jobRepository.count() + 1;
        return String.format("%02d--%03d", year, count);
    }

    private void createInitialProgress(Job job) {
        WorkProgress initialProgress = new WorkProgress();
        initialProgress.setJobId(job.getJobId());
        initialProgress.setProgressDate(LocalDate.now());
        initialProgress.setNewStatus(job.getStatus().toString());
        initialProgress.setProgressPercentage(0);
        initialProgress.setNotes("Job created");
        workProgressRepository.save(initialProgress);
    }

    private void createProgressEntry(Job job, Job.JobStatus oldStatus, Job.JobStatus newStatus) {
        WorkProgress progress = new WorkProgress();
        progress.setJobId(job.getJobId());
        progress.setProgressDate(LocalDate.now());
        progress.setPreviousStatus(oldStatus.toString());
        progress.setNewStatus(newStatus.toString());
        progress.setNotes("Status changed from " + oldStatus + " to " + newStatus);
        workProgressRepository.save(progress);
    }
}

