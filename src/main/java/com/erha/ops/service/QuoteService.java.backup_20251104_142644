package com.erha.ops.service;

import com.erha.ops.entity.Quote;
import com.erha.ops.entity.Job;
import com.erha.ops.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private JobService jobService;

    // Create a new quote
    public Quote createQuote(Quote quote) {
        // Generate quote number if not provided
        if (quote.getQuoteNumber() == null || quote.getQuoteNumber().isEmpty()) {
            quote.setQuoteNumber(generateQuoteNumber());
        }
        
        // Set timestamps
        if (quote.getQuoteDate() == null) {
            quote.setQuoteDate(LocalDate.now());
        }
        
        return quoteRepository.save(quote);
    }

    // Simple quote number generator
    private String generateQuoteNumber() {
        int year = LocalDate.now().getYear();
        long count = quoteRepository.count() + 1;
        return String.format("Q-%d-%03d", year, count);
    }

    // Get all quotes
    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    // Get quote by ID
    public Optional<Quote> getQuoteById(Long id) {
        return quoteRepository.findById(id);
    }

    // Get quote by quote number
    public Optional<Quote> getQuoteByNumber(String quoteNumber) {
        return quoteRepository.findByQuoteNumber(quoteNumber);
    }

    // Get quotes by RFQ ID
    public List<Quote> getQuotesByRfqId(Long rfqId) {
        return quoteRepository.findByRfqId(rfqId);
    }

    // Get quotes by client ID
    public List<Quote> getQuotesByClientId(Long clientId) {
        return quoteRepository.findByClientId(clientId);
    }

    // Get quotes by status
    public List<Quote> getQuotesByStatus(Quote.QuoteStatus status) {
        return quoteRepository.findByQuoteStatus(status);
    }

    // Update quote
    public Quote updateQuote(Long id, Quote quoteDetails) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));

        // Update fields
        if (quoteDetails.getRfqId() != null) {
            quote.setRfqId(quoteDetails.getRfqId());
        }
        if (quoteDetails.getQuoteDate() != null) {
            quote.setQuoteDate(quoteDetails.getQuoteDate());
        }
        if (quoteDetails.getValidUntilDate() != null) {
            quote.setValidUntilDate(quoteDetails.getValidUntilDate());
        }
        if (quoteDetails.getClientId() != null) {
            quote.setClientId(quoteDetails.getClientId());
        }
        if (quoteDetails.getValueExclVat() != null) {
            quote.setValueExclVat(quoteDetails.getValueExclVat());
        }
        if (quoteDetails.getValueInclVat() != null) {
            quote.setValueInclVat(quoteDetails.getValueInclVat());
        }
        if (quoteDetails.getQuoteStatus() != null) {
            quote.setQuoteStatus(quoteDetails.getQuoteStatus());
        }
        if (quoteDetails.getNotes() != null) {
            quote.setNotes(quoteDetails.getNotes());
        }

        return quoteRepository.save(quote);
    }

    // Delete quote
    public void deleteQuote(Long id) {
        quoteRepository.deleteById(id);
    }

    // Get quote statistics
    public QuoteStatistics getQuoteStatistics() {
        List<Quote> allQuotes = quoteRepository.findAll();
        
        long totalQuotes = allQuotes.size();
        long draftQuotes = quoteRepository.countByStatus(Quote.QuoteStatus.DRAFT);
        long submittedQuotes = quoteRepository.countByStatus(Quote.QuoteStatus.SUBMITTED);
        long acceptedQuotes = quoteRepository.countByStatus(Quote.QuoteStatus.ACCEPTED);
        long rejectedQuotes = quoteRepository.countByStatus(Quote.QuoteStatus.REJECTED);
        
        return new QuoteStatistics(totalQuotes, draftQuotes, submittedQuotes, 
                                   acceptedQuotes, rejectedQuotes);
    }

    // Inner class for statistics
    /**
     * Accept a quote and generate a job
     */
    public Job acceptQuote(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found with id: " + quoteId));
        
        if (quote.getQuoteStatus() != Quote.QuoteStatus.SENT) {
            throw new RuntimeException("Quote must be in SENT status to accept. Current status: " + quote.getQuoteStatus());
        }
        
        if (quote.getJobId() != null) {
            throw new RuntimeException("Quote has already been converted to Job ID: " + quote.getJobId());
        }
        
        Job job = new Job();
        job.setQuoteId(quote.getQuoteId());
        job.setRfqId(quote.getRfqId());
        job.setClientId(quote.getClientId());
        job.setDescription("Job from Quote " + quote.getQuoteNumber());
        job.setOrderValueExcl(quote.getValueExclVat());
        job.setOrderValueIncl(quote.getValueInclVat());
        job.setOrderReceivedDate(LocalDate.now());
        job.setStatus(Job.JobStatus.NEW);
        job.setPriority(Job.JobPriority.MEDIUM);
        job.setJobType(Job.JobType.NORMAL);
        job.setLocation(Job.JobLocation.SHOP);
        job.setCreatedBy("System");
        
        Job savedJob = jobService.createJob(job);
        
        quote.setJobId(savedJob.getJobId());
        quote.setQuoteStatus(Quote.QuoteStatus.ACCEPTED);
        quoteRepository.save(quote);
        
        return savedJob;
    }


    public static class QuoteStatistics {
        private long totalQuotes;
        private long draftQuotes;
        private long submittedQuotes;
        private long acceptedQuotes;
        private long rejectedQuotes;

        public QuoteStatistics(long totalQuotes, long draftQuotes, long submittedQuotes,
                              long acceptedQuotes, long rejectedQuotes) {
            this.totalQuotes = totalQuotes;
            this.draftQuotes = draftQuotes;
            this.submittedQuotes = submittedQuotes;
            this.acceptedQuotes = acceptedQuotes;
            this.rejectedQuotes = rejectedQuotes;
        }

        // Getters
        public long getTotalQuotes() { return totalQuotes; }
        public long getDraftQuotes() { return draftQuotes; }
        public long getSubmittedQuotes() { return submittedQuotes; }
        public long getAcceptedQuotes() { return acceptedQuotes; }
        public long getRejectedQuotes() { return rejectedQuotes; }
    }
}