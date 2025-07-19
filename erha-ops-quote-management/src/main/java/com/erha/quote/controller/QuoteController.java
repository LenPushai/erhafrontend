package com.erha.quote.controller;

import com.erha.quote.dto.QuoteDTO;
import com.erha.quote.model.QuoteStatus;
import com.erha.quote.model.QuotePriority;
import com.erha.quote.model.RiskLevel;
import com.erha.quote.service.QuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ðŸ’° Quote Management REST Controller
 * Professional quote creation, approval, and client communication endpoints
 * 
 * @author Dynamic Duo Engineering Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/quotes")
@Tag(name = "Quote Management", description = "Professional quote creation, approval, and client communication with quality assurance costing")
@CrossOrigin(origins = "*")
public class QuoteController {
    
    private final QuoteService quoteService;
    
    @Autowired
    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }
    
    // ðŸŽ¯ CORE CRUD OPERATIONS
    
    @Operation(summary = "Create New Quote", description = "Create a new quote with quality and safety cost integration")
    @PostMapping
    public ResponseEntity<QuoteDTO> createQuote(@Valid @RequestBody QuoteDTO quoteDTO) {
        QuoteDTO createdQuote = quoteService.createQuote(quoteDTO);
        return new ResponseEntity<>(createdQuote, HttpStatus.CREATED);
    }
    
    @Operation(summary = "Get Quote by ID", description = "Retrieve a specific quote by its unique identifier")
    @GetMapping("/{id}")
    public ResponseEntity<QuoteDTO> getQuoteById(@PathVariable Long id) {
        QuoteDTO quote = quoteService.getQuoteById(id);
        return ResponseEntity.ok(quote);
    }
    
    @Operation(summary = "Get Quote by Number", description = "Retrieve a quote by its quote number")
    @GetMapping("/number/{quoteNumber}")
    public ResponseEntity<QuoteDTO> getQuoteByNumber(@PathVariable String quoteNumber) {
        QuoteDTO quote = quoteService.getQuoteByNumber(quoteNumber);
        return ResponseEntity.ok(quote);
    }
    
    @Operation(summary = "Update Quote", description = "Update an existing quote with new information")
    @PutMapping("/{id}")
    public ResponseEntity<QuoteDTO> updateQuote(@PathVariable Long id, @Valid @RequestBody QuoteDTO quoteDTO) {
        QuoteDTO updatedQuote = quoteService.updateQuote(id, quoteDTO);
        return ResponseEntity.ok(updatedQuote);
    }
    
    @Operation(summary = "Delete Quote", description = "Delete a quote (only if not approved or converted)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long id) {
        quoteService.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }
    
    // ðŸ“‹ LISTING & PAGINATION
    
    @Operation(summary = "Get All Quotes", description = "Retrieve paginated list of all quotes")
    @GetMapping
    public ResponseEntity<Page<QuoteDTO>> getAllQuotes(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<QuoteDTO> quotes = quoteService.getAllQuotes(pageable);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by Status", description = "Retrieve quotes filtered by status")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<QuoteDTO>> getQuotesByStatus(
            @PathVariable QuoteStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<QuoteDTO> quotes = quoteService.getQuotesByStatus(status, pageable);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by Priority", description = "Retrieve quotes filtered by priority level")
    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<QuoteDTO>> getQuotesByPriority(
            @PathVariable QuotePriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<QuoteDTO> quotes = quoteService.getQuotesByPriority(priority, pageable);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by RFQ", description = "Retrieve all quotes associated with a specific RFQ")
    @GetMapping("/rfq/{rfqId}")
    public ResponseEntity<List<QuoteDTO>> getQuotesByRfqId(@PathVariable Long rfqId) {
        List<QuoteDTO> quotes = quoteService.getQuotesByRfqId(rfqId);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by Client", description = "Retrieve quotes for a specific client")
    @GetMapping("/client/{clientName}")
    public ResponseEntity<List<QuoteDTO>> getQuotesByClient(@PathVariable String clientName) {
        List<QuoteDTO> quotes = quoteService.getQuotesByClient(clientName);
        return ResponseEntity.ok(quotes);
    }
    
    // ðŸ’° FINANCIAL OPERATIONS
    
    @Operation(summary = "Get High Value Quotes", description = "Retrieve quotes above specified value threshold")
    @GetMapping("/high-value")
    public ResponseEntity<List<QuoteDTO>> getHighValueQuotes(
            @Parameter(description = "Minimum quote value threshold") @RequestParam BigDecimal threshold) {
        List<QuoteDTO> quotes = quoteService.getHighValueQuotes(threshold);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by Value Range", description = "Retrieve quotes within specified value range")
    @GetMapping("/value-range")
    public ResponseEntity<List<QuoteDTO>> getQuotesByValueRange(
            @Parameter(description = "Minimum amount") @RequestParam BigDecimal minAmount,
            @Parameter(description = "Maximum amount") @RequestParam BigDecimal maxAmount) {
        List<QuoteDTO> quotes = quoteService.getQuotesByValueRange(minAmount, maxAmount);
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Total Approved Value", description = "Get total value of all approved quotes")
    @GetMapping("/total-approved-value")
    public ResponseEntity<BigDecimal> getTotalApprovedValue() {
        BigDecimal total = quoteService.getTotalApprovedValue();
        return ResponseEntity.ok(total);
    }
    
    @Operation(summary = "Get Average Quote Value", description = "Get average value of approved quotes")
    @GetMapping("/average-value")
    public ResponseEntity<BigDecimal> getAverageQuoteValue() {
        BigDecimal average = quoteService.getAverageQuoteValue();
        return ResponseEntity.ok(average);
    }
    
    // ðŸŽ¯ WORKFLOW OPERATIONS
    
    @Operation(summary = "Approve Quote", description = "Approve a quote for client presentation")
    @PostMapping("/{id}/approve")
    public ResponseEntity<QuoteDTO> approveQuote(
            @PathVariable Long id,
            @Parameter(description = "Approver name") @RequestParam String approver) {
        QuoteDTO approvedQuote = quoteService.approveQuote(id, approver);
        return ResponseEntity.ok(approvedQuote);
    }
    
    @Operation(summary = "Reject Quote", description = "Reject a quote with reason")
    @PostMapping("/{id}/reject")
    public ResponseEntity<QuoteDTO> rejectQuote(
            @PathVariable Long id,
            @Parameter(description = "Reviewer name") @RequestParam String reviewer,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        QuoteDTO rejectedQuote = quoteService.rejectQuote(id, reviewer, reason);
        return ResponseEntity.ok(rejectedQuote);
    }
    
    @Operation(summary = "Send Quote to Client", description = "Send approved quote to client")
    @PostMapping("/{id}/send-to-client")
    public ResponseEntity<QuoteDTO> sendToClient(@PathVariable Long id) {
        QuoteDTO sentQuote = quoteService.sendToClient(id);
        return ResponseEntity.ok(sentQuote);
    }
    
    @Operation(summary = "Convert to Contract", description = "Convert accepted quote to contract")
    @PostMapping("/{id}/convert-to-contract")
    public ResponseEntity<QuoteDTO> convertToContract(@PathVariable Long id) {
        QuoteDTO convertedQuote = quoteService.convertToContract(id);
        return ResponseEntity.ok(convertedQuote);
    }
    
    @Operation(summary = "Recalculate Quote Totals", description = "Recalculate quote totals based on line items")
    @PostMapping("/{id}/recalculate")
    public ResponseEntity<Void> recalculateQuoteTotals(@PathVariable Long id) {
        quoteService.calculateQuoteTotals(id);
        return ResponseEntity.ok().build();
    }
    
    // ðŸ“… TIME-BASED OPERATIONS
    
    @Operation(summary = "Get Expired Quotes", description = "Retrieve all expired quotes")
    @GetMapping("/expired")
    public ResponseEntity<List<QuoteDTO>> getExpiredQuotes() {
        List<QuoteDTO> expiredQuotes = quoteService.getExpiredQuotes();
        return ResponseEntity.ok(expiredQuotes);
    }
    
    @Operation(summary = "Get Quotes Expiring Soon", description = "Retrieve quotes expiring within specified days")
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<QuoteDTO>> getQuotesExpiringSoon(
            @Parameter(description = "Days ahead to check") @RequestParam(defaultValue = "7") int days) {
        List<QuoteDTO> expiringQuotes = quoteService.getQuotesExpiringWithin(days);
        return ResponseEntity.ok(expiringQuotes);
    }
    
    @Operation(summary = "Get Recent Quotes", description = "Retrieve most recently created quotes")
    @GetMapping("/recent")
    public ResponseEntity<List<QuoteDTO>> getRecentQuotes(
            @Parameter(description = "Number of quotes to retrieve") @RequestParam(defaultValue = "10") int limit) {
        List<QuoteDTO> recentQuotes = quoteService.getRecentQuotes(limit);
        return ResponseEntity.ok(recentQuotes);
    }
    
    @Operation(summary = "Get Stale Quotes", description = "Retrieve quotes that haven't been updated recently")
    @GetMapping("/stale")
    public ResponseEntity<List<QuoteDTO>> getStaleQuotes(
            @Parameter(description = "Days of inactivity") @RequestParam(defaultValue = "30") int daysCutoff) {
        List<QuoteDTO> staleQuotes = quoteService.getStaleQuotes(daysCutoff);
        return ResponseEntity.ok(staleQuotes);
    }
    
    // ðŸ” SEARCH & FILTER
    
    @Operation(summary = "Advanced Search", description = "Search quotes with multiple filter criteria")
    @GetMapping("/search")
    public ResponseEntity<Page<QuoteDTO>> searchQuotes(
            @Parameter(description = "Client name filter") @RequestParam(required = false) String clientName,
            @Parameter(description = "Project title filter") @RequestParam(required = false) String projectTitle,
            @Parameter(description = "Status filter") @RequestParam(required = false) QuoteStatus status,
            @Parameter(description = "Priority filter") @RequestParam(required = false) QuotePriority priority,
            @Parameter(description = "Minimum amount") @RequestParam(required = false) BigDecimal minAmount,
            @Parameter(description = "Maximum amount") @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<QuoteDTO> quotes = quoteService.searchQuotes(
            clientName, projectTitle, status, priority, minAmount, maxAmount, pageable);
        return ResponseEntity.ok(quotes);
    }
    
    // ðŸ“Š ANALYTICS & REPORTING
    
    @Operation(summary = "Get Quote Analytics", description = "Retrieve comprehensive quote analytics")
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getQuoteAnalytics() {
        Map<String, Object> analytics = quoteService.getQuoteAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    @Operation(summary = "Get Status Counts", description = "Get count of quotes by status")
    @GetMapping("/analytics/status-counts")
    public ResponseEntity<Map<QuoteStatus, Long>> getStatusCounts() {
        Map<QuoteStatus, Long> statusCounts = quoteService.getStatusCounts();
        return ResponseEntity.ok(statusCounts);
    }
    
    @Operation(summary = "Get Priority Counts", description = "Get count of quotes by priority")
    @GetMapping("/analytics/priority-counts")
    public ResponseEntity<Map<QuotePriority, Long>> getPriorityCounts() {
        Map<QuotePriority, Long> priorityCounts = quoteService.getPriorityCounts();
        return ResponseEntity.ok(priorityCounts);
    }
    
    @Operation(summary = "Get Daily Creation Stats", description = "Get daily quote creation statistics")
    @GetMapping("/analytics/daily-creation")
    public ResponseEntity<List<Map<String, Object>>> getDailyCreationStats(
            @Parameter(description = "Number of days to analyze") @RequestParam(defaultValue = "30") int days) {
        List<Map<String, Object>> stats = quoteService.getDailyCreationStats(days);
        return ResponseEntity.ok(stats);
    }
    
    // ðŸ† QUALITY & SAFETY OPERATIONS
    
    @Operation(summary = "Get ISO 9001 Required Quotes", description = "Retrieve quotes requiring ISO 9001 compliance")
    @GetMapping("/iso9001-required")
    public ResponseEntity<List<QuoteDTO>> getIso9001RequiredQuotes() {
        List<QuoteDTO> quotes = quoteService.getIso9001RequiredQuotes();
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes with Quality Costs", description = "Retrieve quotes with quality or safety costs")
    @GetMapping("/with-quality-costs")
    public ResponseEntity<List<QuoteDTO>> getQuotesWithQualityCosts() {
        List<QuoteDTO> quotes = quoteService.getQuotesWithQualityCosts();
        return ResponseEntity.ok(quotes);
    }
    
    @Operation(summary = "Get Quotes by Risk Level", description = "Retrieve quotes by risk assessment level")
    @GetMapping("/risk-level/{riskLevel}")
    public ResponseEntity<List<QuoteDTO>> getQuotesByRiskLevel(@PathVariable RiskLevel riskLevel) {
        List<QuoteDTO> quotes = quoteService.getQuotesByRiskLevel(riskLevel);
        return ResponseEntity.ok(quotes);
    }
    
    // ðŸ”„ INTEGRATION ENDPOINTS
    
    @Operation(summary = "Link Quote to RFQ", description = "Associate quote with an RFQ")
    @PostMapping("/{quoteId}/link-rfq/{rfqId}")
    public ResponseEntity<Void> linkToRfq(@PathVariable Long quoteId, @PathVariable Long rfqId) {
        quoteService.linkToRfq(quoteId, rfqId);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Generate Quote Number", description = "Generate new quote number")
    @GetMapping("/generate-number")
    public ResponseEntity<String> generateQuoteNumber() {
        String quoteNumber = quoteService.generateQuoteNumber();
        return ResponseEntity.ok(quoteNumber);
    }
    
    // ðŸ¥ HEALTH CHECK
    
    @Operation(summary = "Health Check", description = "Check if Quote Management service is operational")
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = Map.of(
            "status", "UP",
            "service", "Quote Management",
            "version", "1.0.0",
            "timestamp", java.time.LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(health);
    }
    
    // ðŸ“Š COUNT ENDPOINT
    
    @Operation(summary = "Get Quote Count", description = "Get total number of quotes in system")
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getQuoteCount() {
        Map<String, Object> response = Map.of(
            "totalQuotes", quoteService.getQuoteAnalytics().get("totalQuotes"),
            "message", "ðŸ’° QUOTE MANAGEMENT MODULE OPERATIONAL! ðŸ’°"
        );
        return ResponseEntity.ok(response);
    }
}
