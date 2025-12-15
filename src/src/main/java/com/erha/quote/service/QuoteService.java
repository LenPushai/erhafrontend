package com.erha.quote.service;

import com.erha.quote.model.Quote;
import com.erha.quote.model.QuoteStatus;
import com.erha.quote.model.QuotePriority;
import com.erha.quote.repository.QuoteRepository;
import com.erha.quote.util.QuoteUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Quote Service for ERHA OPS Quote Management
 * Enhanced with Quality Cost Integration & Safety Assessment
 */
@Service
@Transactional
public class QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

    // ================================
    // CRUD Operations
    // ================================

    public Quote createQuote(Quote quote) {
        // Generate quote number if not provided
        if (quote.getQuoteNumber() == null || quote.getQuoteNumber().isEmpty()) {
            quote.setQuoteNumber(generateQuoteNumber());
        }
        
        // Calculate totals
        quote.calculateTotal();
        
        return quoteRepository.save(quote);
    }

    public Optional<Quote> getQuoteById(UUID id) {
        return quoteRepository.findById(id);
    }

    public Optional<Quote> getQuoteById(Long id) {
        return quoteRepository.findById(QuoteUtils.longToUUID(id));
    }

    public Quote updateQuote(Quote quote) {
        // Recalculate totals on update
        quote.calculateTotal();
        return quoteRepository.save(quote);
    }

    public Quote updateQuote(Long id, Quote quote) {
        quote.setId(QuoteUtils.longToUUID(id));
        return updateQuote(quote);
    }

    public void deleteQuote(UUID id) {
        quoteRepository.deleteById(id);
    }

    public void deleteQuote(Long id) {
        quoteRepository.deleteById(QuoteUtils.longToUUID(id));
    }

    // ================================
    // Search and Filter Operations
    // ================================

    public List<Quote> getAllQuotes() {
        return quoteRepository.findByDeletedAtIsNull();
    }

    public List<Quote> getQuotesByStatus(QuoteStatus status) {
        return quoteRepository.findByStatus(status);
    }

    public List<Quote> getQuotesByStatus(QuoteStatus status, Pageable pageable) {
        // Convert to Page and return content as List
        return quoteRepository.findByStatus(status);
    }

    public List<Quote> getQuotesByPriority(QuotePriority priority) {
        return quoteRepository.findByPriority(priority);
    }

    public List<Quote> getQuotesByClientId(UUID clientId) {
        return quoteRepository.findByClientId(clientId);
    }

    public List<Quote> searchQuotesByTitle(String title) {
        return quoteRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Quote> searchQuotes(String searchTerm) {
        return quoteRepository.searchQuotes(searchTerm);
    }

    public List<Quote> searchQuotesByClient(String clientReference) {
        // Use the general search since we don't have client name in Quote entity
        return quoteRepository.searchQuotes(clientReference);
    }

    public List<Quote> getHighValueQuotes(BigDecimal minAmount) {
        return quoteRepository.findByTotalAmountGreaterThan(minAmount);
    }

    // ================================
    // Business Logic Operations
    // ================================

    public Quote approveQuote(UUID quoteId, String approverNotes) {
        Optional<Quote> quoteOpt = quoteRepository.findById(quoteId);
        if (quoteOpt.isPresent()) {
            Quote quote = quoteOpt.get();
            quote.approve(approverNotes);
            return quoteRepository.save(quote);
        }
        throw new RuntimeException("Quote not found: " + quoteId);
    }

    public Quote sendQuoteToClient(UUID quoteId) {
        Optional<Quote> quoteOpt = quoteRepository.findById(quoteId);
        if (quoteOpt.isPresent()) {
            Quote quote = quoteOpt.get();
            quote.sendToClient();
            return quoteRepository.save(quote);
        }
        throw new RuntimeException("Quote not found: " + quoteId);
    }

    public Quote markQuoteAsViewed(UUID quoteId) {
        Optional<Quote> quoteOpt = quoteRepository.findById(quoteId);
        if (quoteOpt.isPresent()) {
            Quote quote = quoteOpt.get();
            quote.markAsViewed();
            return quoteRepository.save(quote);
        }
        throw new RuntimeException("Quote not found: " + quoteId);
    }

    // ================================
    // Analytics and Reporting
    // ================================

    public BigDecimal getTotalApprovedValue() {
        BigDecimal total = quoteRepository.getAverageAcceptedQuoteValue();
        // Get count and multiply by average (simplified approach)
        Long count = quoteRepository.countByStatus(QuoteStatus.ACCEPTED);
        return total != null && count != null ? total.multiply(BigDecimal.valueOf(count)) : BigDecimal.ZERO;
    }

    public BigDecimal getAverageQuoteValue() {
        return quoteRepository.getAverageAcceptedQuoteValue();
    }

    public BigDecimal getTotalQualityAndSafetyCosts() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        return quoteRepository.getTotalQualityAndSafetyCostsSince(startOfMonth);
    }

    public List<Quote> getExpiredQuotes() {
        return quoteRepository.findByValidUntilBefore(LocalDateTime.now());
    }

    public List<Quote> getRecentQuotes(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        return quoteRepository.findByCreatedAtBetween(since, LocalDateTime.now());
    }

    public List<Quote> getRecentQuotes(Pageable pageable) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        return quoteRepository.findByCreatedAtBetween(since, LocalDateTime.now());
    }

    // ================================
    // Quality and Safety Operations
    // ================================

    public List<Quote> getHighRiskQuotes() {
        return quoteRepository.findHighRiskActiveQuotes(75); // Risk score >= 75
    }

    public List<Quote> getQuotesWithQualityCosts() {
        return quoteRepository.findQuotesWithQualityOrSafetyCosts();
    }

    public List<Quote> getQuotesByQualityLevel(Quote.QualityLevel qualityLevel) {
        return quoteRepository.findByQualityLevel(qualityLevel);
    }

    public List<Quote> getQuotesByRiskRange(Integer minRisk, Integer maxRisk) {
        return quoteRepository.findByRiskScoreBetween(minRisk, maxRisk);
    }

    // ================================
    // Dashboard Statistics
    // ================================

    public Long getQuoteCountByStatus(QuoteStatus status) {
        return quoteRepository.countByStatus(status);
    }

    public List<Object[]> getQuoteStatsByStatus() {
        return quoteRepository.getQuoteCountByStatus();
    }

    public List<Object[]> getAverageValueByPriority() {
        return quoteRepository.getAverageValueByPriority();
    }

    public List<Object[]> getMonthlyQuoteStats(Integer year) {
        return quoteRepository.getMonthlyQuoteCount(year);
    }

    // ================================
    // Workflow Operations
    // ================================

    public List<Quote> getPendingApprovalQuotes() {
        return quoteRepository.findByApprovedByIsNull();
    }

    public List<Quote> getApprovedQuotes() {
        return quoteRepository.findByApprovedByIsNotNull();
    }

    public List<Quote> getSentQuotes() {
        return quoteRepository.findBySentAtIsNotNull();
    }

    public List<Quote> getViewedQuotes() {
        return quoteRepository.findByViewedAtIsNotNull();
    }

    // ================================
    // Utility Methods
    // ================================

    private String generateQuoteNumber() {
        // Get current year
        int year = LocalDateTime.now().getYear();
        
        // Count quotes created this year
        LocalDateTime yearStart = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime yearEnd = LocalDateTime.of(year + 1, 1, 1, 0, 0);
        
        long count = quoteRepository.findByCreatedAtBetween(yearStart, yearEnd).size();
        
        // Generate quote number
        return String.format("QUO-%d-%05d", year, count + 1);
    }

    public boolean existsById(UUID id) {
        return quoteRepository.existsById(id);
    }

    public boolean existsById(Long id) {
        return quoteRepository.existsById(QuoteUtils.longToUUID(id));
    }

    public long getTotalCount() {
        return quoteRepository.count();
    }

    // ================================
    // Batch Operations
    // ================================

    public List<Quote> saveAll(List<Quote> quotes) {
        quotes.forEach(Quote::calculateTotal);
        return quoteRepository.saveAll(quotes);
    }

    public void deleteAll(List<Quote> quotes) {
        quoteRepository.deleteAll(quotes);
    }

    // ================================
    // Advanced Search
    // ================================

    public List<Quote> findByMultipleCriteria(QuoteStatus status, QuotePriority priority, 
                                             LocalDateTime startDate, LocalDateTime endDate) {
        List<Quote> results = quoteRepository.findByStatus(status);
        
        if (priority != null) {
            results = results.stream()
                    .filter(q -> q.getPriority() == priority)
                    .toList();
        }
        
        if (startDate != null && endDate != null) {
            results = results.stream()
                    .filter(q -> q.getCreatedAt().isAfter(startDate) && q.getCreatedAt().isBefore(endDate))
                    .toList();
        }
        
        return results;
    }

    // ================================
    // Exception Handling
    // ================================

    public Quote getQuoteByIdOrThrow(UUID id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
    }

    public Quote getQuoteByIdOrThrow(Long id) {
        return getQuoteByIdOrThrow(QuoteUtils.longToUUID(id));
    }
}
