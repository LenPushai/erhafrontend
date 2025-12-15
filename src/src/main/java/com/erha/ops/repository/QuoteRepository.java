package com.erha.ops.repository;

import com.erha.ops.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    
    // Find by quote number
    Optional<Quote> findByQuoteNumber(String quoteNumber);
    
    // Find by RFQ ID
    List<Quote> findByRfqId(Long rfqId);
    
    // Find by client ID
    List<Quote> findByClientId(Long clientId);
    
    // Find by quote status
    List<Quote> findByQuoteStatus(Quote.QuoteStatus quoteStatus);
    
    // Find quotes by date range (using quoteDate instead of sentDate)
    List<Quote> findByQuoteDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find quotes expiring soon
    @Query("SELECT q FROM Quote q WHERE q.validUntilDate BETWEEN :startDate AND :endDate")
    List<Quote> findQuotesExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find quotes by client and status
    List<Quote> findByClientIdAndQuoteStatus(Long clientId, Quote.QuoteStatus quoteStatus);
    
    // Count quotes by status
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.quoteStatus = :status")
    long countByStatus(@Param("status") Quote.QuoteStatus status);
    
    // Find recent quotes (created in last N days)
    @Query("SELECT q FROM Quote q WHERE q.createdDate >= :sinceDate ORDER BY q.createdDate DESC")
    List<Quote> findRecentQuotes(@Param("sinceDate") LocalDate sinceDate);

    Optional<Quote> findByDocusignEnvelopeId(String envelopeId);
}
