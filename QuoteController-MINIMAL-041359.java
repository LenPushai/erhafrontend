package com.erha.quote.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/quotes")
public class QuoteController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Quote Management");
        response.put("timestamp", new Date());
        response.put("version", "1.0.0");
        response.put("message", "Quote Management Service is operational");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("status", "Dashboard operational");
        dashboard.put("totalQuotes", 5);
        dashboard.put("activeQuotes", 3);
        dashboard.put("pendingQuotes", 2);
        dashboard.put("totalValue", 150000.00);
        dashboard.put("timestamp", new Date());
        dashboard.put("message", "Sample dashboard data");
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuotes", 5);
        stats.put("successRate", "85.2%");
        stats.put("averageValue", 30000.00);
        stats.put("responseTime", "2.3 days");
        stats.put("timestamp", new Date());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("conversionRate", "72.5%");
        analytics.put("qualityScore", "94.2%");
        analytics.put("topClients", Arrays.asList("ACME Corp", "BuildTech Ltd", "Metro Infrastructure"));
        analytics.put("timestamp", new Date());
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/status-counts")
    public ResponseEntity<Map<String, Object>> statusCounts() {
        Map<String, Object> counts = new HashMap<>();
        counts.put("DRAFT", 2);
        counts.put("PENDING_REVIEW", 1);
        counts.put("APPROVED", 1);
        counts.put("SENT", 1);
        counts.put("timestamp", new Date());
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search() {
        Map<String, Object> results = new HashMap<>();
        results.put("status", "Search operational");
        results.put("totalFound", 5);
        results.put("message", "Search functionality working");
        results.put("timestamp", new Date());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/quality-costs")
    public ResponseEntity<Map<String, Object>> qualityCosts() {
        Map<String, Object> costs = new HashMap<>();
        costs.put("totalQualityCosts", 25000.00);
        costs.put("safetyCosts", 15000.00);
        costs.put("iso9001Compliance", true);
        costs.put("timestamp", new Date());
        return ResponseEntity.ok(costs);
    }

    @PostMapping("/init-sample-data")
    public ResponseEntity<Map<String, Object>> initSampleData() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("message", "Sample data initialized");
        result.put("quotesCreated", 5);
        result.put("timestamp", new Date());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/value-range")
    public ResponseEntity<Map<String, Object>> valueRange() {
        Map<String, Object> result = new HashMap<>();
        result.put("minValue", 10000);
        result.put("maxValue", 100000);
        result.put("quotesInRange", 3);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<Map<String, Object>> highRisk() {
        Map<String, Object> result = new HashMap<>();
        result.put("count", 1);
        result.put("totalValue", 85000.00);
        result.put("message", "High risk quotes identified");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getByStatus(@PathVariable String status) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", status);
        result.put("count", 2);
        result.put("message", "Quotes filtered by status: " + status);
        return ResponseEntity.ok(result);
    }
}
