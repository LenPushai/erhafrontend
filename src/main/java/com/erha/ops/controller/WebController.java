package com.erha.ops.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Controller
public class WebController {

    private static final Logger logger = LoggerFactory.getLogger(WebController.class);

    private final RestTemplate restTemplate = new RestTemplate();

    // Internal API URLs (same application)
    private static final String RFQ_METRICS_URL = "http://localhost:8084/api/v1/rfq/dashboard-metrics";
    private static final String RFQ_LIST_URL = "http://localhost:8084/api/v1/rfq";
    private static final String QUOTES_LIST_URL = "http://localhost:8084/api/v1/quotes";

    /**
     * Main Dashboard Route
     */
    @GetMapping("/")
    public String dashboard(Model model) {
        logger.info("Loading dashboard");

        try {
            // Get dashboard metrics from your existing endpoint
            Map<String, Object> metrics = getDashboardMetrics();

            // Add metrics to model for Thymeleaf template
            model.addAttribute("metrics", metrics);
            model.addAttribute("lastUpdated", new Date());
            model.addAttribute("pageTitle", "ERHA Operations Dashboard");

            return "dashboard"; // returns src/main/resources/templates/dashboard.html

        } catch (Exception e) {
            logger.error("Error loading dashboard: ", e);
            model.addAttribute("error", "Unable to load dashboard data");
            return "error";
        }
    }

    /**
     * RFQ Management Routes
     */
    @GetMapping("/rfq")
    public String rfqList(Model model) {
        logger.info("Loading RFQ list");

        try {
            List<Map<String, Object>> rfqList = getRfqList();
            model.addAttribute("rfqs", rfqList);
            model.addAttribute("pageTitle", "RFQ Management");

            return "rfq/list";

        } catch (Exception e) {
            logger.error("Error loading RFQ list: ", e);
            model.addAttribute("error", "Unable to load RFQ data");
            return "error";
        }
    }

    @GetMapping("/rfq/new")
    public String newRfq(Model model) {
        model.addAttribute("pageTitle", "New RFQ");
        return "rfq/create";
    }

    @GetMapping("/rfq/{id}")
    public String viewRfq(@PathVariable Long id, Model model) {
        logger.info("Loading RFQ details for ID: {}", id);

        try {
            // Get RFQ details from your existing API
            Map<String, Object> rfq = getRfqById(id);
            model.addAttribute("rfq", rfq);
            model.addAttribute("pageTitle", "RFQ Details");

            return "rfq/detail";

        } catch (Exception e) {
            logger.error("Error loading RFQ {}: ", id, e);
            model.addAttribute("error", "Unable to load RFQ details");
            return "error";
        }
    }

    /**
     * Quote Management Routes
     */
    @GetMapping("/quotes")
    public String quotesList(Model model) {
        logger.info("Loading quotes list");

        try {
            List<Map<String, Object>> quotes = getQuotesList();
            model.addAttribute("quotes", quotes);
            model.addAttribute("pageTitle", "Quote Management");

            return "quotes/list";

        } catch (Exception e) {
            logger.error("Error loading quotes list: ", e);
            model.addAttribute("error", "Unable to load quotes data");
            return "error";
        }
    }

    @GetMapping("/quotes/new")
    public String newQuote(@RequestParam(required = false) Long rfqId, Model model) {
        model.addAttribute("rfqId", rfqId);
        model.addAttribute("pageTitle", "New Quote");
        return "quotes/create";
    }

    /**
     * Project Management Routes
     */
    @GetMapping("/projects")
    public String projectsList(Model model) {
        model.addAttribute("pageTitle", "Project Management");
        return "projects/list";
    }

    /**
     * API Methods to fetch data from existing microservices
     */
    private Map<String, Object> getDashboardMetrics() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(RFQ_METRICS_URL, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = response.getBody();

                // Transform the data structure for Thymeleaf template
                Map<String, Object> priorityMetrics = (Map<String, Object>) data.get("priorityMetrics");
                Map<String, Object> performanceMetrics = (Map<String, Object>) data.get("performanceMetrics");

                Map<String, Object> transformedMetrics = new HashMap<>();
                transformedMetrics.put("actionRequired", priorityMetrics.get("actionRequired"));
                transformedMetrics.put("overdue", priorityMetrics.get("overdue"));
                transformedMetrics.put("inProgress", priorityMetrics.get("inProgress"));
                transformedMetrics.put("awaitingClient", priorityMetrics.get("awaitingClient"));
                transformedMetrics.put("completedThisMonth", performanceMetrics.get("completedThisMonth"));
                transformedMetrics.put("totalRfqs", performanceMetrics.get("totalRfqs"));
                transformedMetrics.put("conversionRate", performanceMetrics.get("conversionRate"));
                transformedMetrics.put("avgProcessingTime", performanceMetrics.get("avgProcessingTime"));

                return transformedMetrics;
            }

        } catch (ResourceAccessException e) {
            logger.warn("RFQ service not available, using mock data");
        } catch (Exception e) {
            logger.error("Error fetching dashboard metrics: ", e);
        }

        // Return mock data if service unavailable
        return getMockDashboardMetrics();
    }

    private List<Map<String, Object>> getRfqList() {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(RFQ_LIST_URL, List.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Error fetching RFQ list: ", e);
        }

        // Return mock data if service unavailable
        return getMockRfqList();
    }

    private Map<String, Object> getRfqById(Long id) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(RFQ_LIST_URL + "/" + id, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Error fetching RFQ {}: ", id, e);
        }

        // Return mock data if service unavailable
        Map<String, Object> mockRfq = new HashMap<>();
        mockRfq.put("id", id);
        mockRfq.put("rfqNumber", "RFQ-2025-001");
        mockRfq.put("clientName", "Sample Client");
        mockRfq.put("status", "IN_PROGRESS");
        mockRfq.put("description", "Sample RFQ for testing");
        return mockRfq;
    }

    private List<Map<String, Object>> getQuotesList() {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(QUOTES_LIST_URL, List.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Error fetching quotes list: ", e);
        }

        // Return mock data if service unavailable
        return getMockQuotesList();
    }

    /**
     * Mock data methods for development/testing
     */
    private Map<String, Object> getMockDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("actionRequired", 5);
        metrics.put("overdue", 2);
        metrics.put("inProgress", 8);
        metrics.put("awaitingClient", 3);
        metrics.put("completedThisMonth", 12);
        metrics.put("totalRfqs", 18);
        metrics.put("conversionRate", "66.7");
        metrics.put("avgProcessingTime", 3.5);
        return metrics;
    }

    private List<Map<String, Object>> getMockRfqList() {
        List<Map<String, Object>> rfqList = new ArrayList<>();

        Map<String, Object> rfq1 = new HashMap<>();
        rfq1.put("id", 1L);
        rfq1.put("rfqNumber", "RFQ-2025-001");
        rfq1.put("clientName", "Sasol Secunda");
        rfq1.put("status", "IN_PROGRESS");
        rfq1.put("dateCreated", "2025-09-20");
        rfq1.put("priority", "HIGH");
        rfqList.add(rfq1);

        Map<String, Object> rfq2 = new HashMap<>();
        rfq2.put("id", 2L);
        rfq2.put("rfqNumber", "RFQ-2025-002");
        rfq2.put("clientName", "Mondi Richards Bay");
        rfq2.put("status", "AWAITING_CLIENT");
        rfq2.put("dateCreated", "2025-09-22");
        rfq2.put("priority", "MEDIUM");
        rfqList.add(rfq2);

        return rfqList;
    }

    private List<Map<String, Object>> getMockQuotesList() {
        List<Map<String, Object>> quotes = new ArrayList<>();

        Map<String, Object> quote1 = new HashMap<>();
        quote1.put("id", 1L);
        quote1.put("quoteNumber", "NE008884");
        quote1.put("rfqId", 1L);
        quote1.put("clientName", "Sasol Secunda");
        quote1.put("amount", 125000.00);
        quote1.put("status", "PENDING");
        quotes.add(quote1);

        return quotes;
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @ResponseBody
    public Map<String, Object> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", new Date());
        health.put("service", "ERHA Operations Web Interface");
        return health;
    }
}