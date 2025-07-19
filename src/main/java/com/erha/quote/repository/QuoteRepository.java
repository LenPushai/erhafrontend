package com.erha.quote.repository;

import com.erha.quote.model.Quote;
import com.erha.quote.model.QuoteStatus;
import com.erha.quote.model.QuotePriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Quote Repository for ERHA OPS Quote Management
 * Enhanced with Quality & Safety Queries
 */
@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    // Basic queries by Quote properties
    List<Quote> findByStatus(QuoteStatus status);
    List<Quote> findByPriority(QuotePriority priority);
    List<Quote> findByClientId(UUID clientId);
    List<Quote> findByCreatedBy(UUID createdBy);
    List<Quote> findByAssignedTo(UUID assignedTo);
    
    // Search queries
    List<Quote> findByTitleContainingIgnoreCase(String title);
    List<Quote> findByDescriptionContainingIgnoreCase(String description);
    List<Quote> findByQuoteNumberContainingIgnoreCase(String quoteNumber);
    
    // Status-based queries
    List<Quote> findByStatusIn(List<QuoteStatus> statuses);
    List<Quote> findByStatusAndPriority(QuoteStatus status, QuotePriority priority);
    
    // Date range queries
    List<Quote> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Quote> findByValidUntilBefore(LocalDateTime date);
    List<Quote> findByValidUntilAfter(LocalDateTime date);
    
    // Quality and Safety queries
    List<Quote> findByRiskScoreGreaterThan(Integer riskScore);
    List<Quote> findByRiskScoreBetween(Integer minRisk, Integer maxRisk);
    List<Quote> findByQualityLevel(Quote.QualityLevel qualityLevel);
    
    // Financial queries
    List<Quote> findByTotalAmountGreaterThan(java.math.BigDecimal amount);
    List<Quote> findByTotalAmountBetween(java.math.BigDecimal minAmount, java.math.BigDecimal maxAmount);
    
    // Approval workflow queries
    List<Quote> findByApprovedByIsNotNull();
    List<Quote> findByApprovedByIsNull();
    List<Quote> findByQualityReviewedByIsNotNull();
    
    // Client communication queries
    List<Quote> findBySentAtIsNotNull();
    List<Quote> findByViewedAtIsNotNull();
    
    // Soft delete support
    List<Quote> findByDeletedAtIsNull();
    List<Quote> findByDeletedAtIsNotNull();
    
    // Custom queries using @Query annotation
    @Query("SELECT q FROM Quote q WHERE q.clientId = :clientId AND q.status = :status")
    List<Quote> findByClientIdAndStatus(@Param("clientId") UUID clientId, @Param("status") QuoteStatus status);
    
    @Query("SELECT q FROM Quote q WHERE q.createdAt >= :startDate AND q.status IN :statuses")
    List<Quote> findRecentQuotesByStatuses(@Param("startDate") LocalDateTime startDate, @Param("statuses") List<QuoteStatus> statuses);
    
    @Query("SELECT q FROM Quote q WHERE q.riskScore >= :minRisk AND q.status != 'CANCELLED'")
    List<Quote> findHighRiskActiveQuotes(@Param("minRisk") Integer minRisk);
    
    @Query("SELECT q FROM Quote q WHERE q.qualityCost > 0 OR q.safetyCost > 0 OR q.complianceCost > 0")
    List<Quote> findQuotesWithQualityOrSafetyCosts();
    
    @Query("SELECT q FROM Quote q WHERE q.totalAmount = (SELECT MAX(q2.totalAmount) FROM Quote q2 WHERE q2.clientId = q.clientId)")
    List<Quote> findHighestValueQuotesByClient();
    
    // Search across multiple fields
    @Query("SELECT q FROM Quote q WHERE " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.quoteNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Quote> searchQuotes(@Param("searchTerm") String searchTerm);
    
    // Dashboard queries
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.status = :status")
    Long countByStatus(@Param("status") QuoteStatus status);
    
    @Query("SELECT AVG(q.totalAmount) FROM Quote q WHERE q.status = 'ACCEPTED'")
    java.math.BigDecimal getAverageAcceptedQuoteValue();
    
    @Query("SELECT SUM(q.qualityCost + q.safetyCost + q.complianceCost) FROM Quote q WHERE q.createdAt >= :startDate")
    java.math.BigDecimal getTotalQualityAndSafetyCostsSince(@Param("startDate") LocalDateTime startDate);
    
    // Analytics queries
    @Query("SELECT q.status, COUNT(q) FROM Quote q GROUP BY q.status")
    List<Object[]> getQuoteCountByStatus();
    
    @Query("SELECT q.priority, AVG(q.totalAmount) FROM Quote q GROUP BY q.priority")
    List<Object[]> getAverageValueByPriority();
    
    @Query("SELECT MONTH(q.createdAt), COUNT(q) FROM Quote q WHERE YEAR(q.createdAt) = :year GROUP BY MONTH(q.createdAt)")
    List<Object[]> getMonthlyQuoteCount(@Param("year") Integer year);
    
    // Custom method to find quotes by client (since we don't have clientName)
    // This would typically join with a Client entity, but for now we use clientId
    default List<Quote> findByClientReference(String clientReference) {
        // This is a placeholder - in a real system you would:
        // 1. Join with Client entity to search by client name
        // 2. Or pass the clientId directly
        // For now, try to search by quote number or title
        return searchQuotes(clientReference);
    }
}
