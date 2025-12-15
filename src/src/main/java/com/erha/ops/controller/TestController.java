package com.erha.ops.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/public/health")
    public String health() {
        return "ERHA OPS System is running! Health check passed.";
    }

    @GetMapping("/public/version")
    public String version() {
        return "ERHA OPS Platform v7.0.0-SNAPSHOT";
    }

    @GetMapping("/test")
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "ERHA Backend is connected");
        response.put("port", "8084");
        return response;
    }

    @GetMapping("/dashboard/stats")
    public Map<String, Integer> getDashboardStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("activeRfqs", 12);
        stats.put("openQuotes", 8);
        stats.put("activeProjects", 5);
        stats.put("invoicesDue", 3);
        return stats;
    }
}