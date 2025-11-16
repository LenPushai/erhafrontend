package com.erha.ops.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rfq")
@CrossOrigin(origins = {"http://localhost:3000"})
public class RFQDashboardController {

    @GetMapping("/dashboard-metrics")
    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Priority Metrics
        Map<String, Object> priorityMetrics = new HashMap<>();
        priorityMetrics.put("actionRequired", 5);
        priorityMetrics.put("overdue", 2);
        priorityMetrics.put("inProgress", 8);
        priorityMetrics.put("awaitingClient", 3);
        metrics.put("priorityMetrics", priorityMetrics);
        
        // Performance Metrics
        Map<String, Object> performanceMetrics = new HashMap<>();
        performanceMetrics.put("totalRfqs", 18);
        performanceMetrics.put("completedThisMonth", 12);
        performanceMetrics.put("avgProcessingTime", 3.5);
        performanceMetrics.put("conversionRate", "66.7");
        metrics.put("performanceMetrics", performanceMetrics);
        
        return metrics;
    }
}