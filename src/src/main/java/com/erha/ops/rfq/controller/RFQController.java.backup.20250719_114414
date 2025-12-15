package com.erha.ops.rfq.controller;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.service.RFQService;
import com.erha.ops.rfq.enums.RFQStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * RFQ Controller - Simplified for initial testing
 * Tests basic CRUD operations
 */
@RestController
@RequestMapping("/api/rfq")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RFQController {
    
    @Autowired
    private RFQService rfqService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRFQs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<RFQ> rfqPage = rfqService.getAllRFQs(pageable);
        
        Map<String, Object> response = Map.of(
            "content", rfqPage.getContent(),
            "totalElements", rfqPage.getTotalElements(),
            "totalPages", rfqPage.getTotalPages(),
            "currentPage", rfqPage.getNumber(),
            "size", rfqPage.getSize()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRFQ(@RequestBody RFQ rfq) {
        try {
            RFQ createdRFQ = rfqService.createRFQ(rfq);
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "RFQ created successfully",
                "data", createdRFQ
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Failed to create RFQ: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRFQById(@PathVariable String id) {
        Optional<RFQ> rfq = rfqService.getRFQById(id);
        if (rfq.isPresent()) {
            Map<String, Object> response = Map.of(
                "success", true,
                "data", rfq.get()
            );
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "RFQ not found"
            );
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RFQ>> getRFQsByStatus(@PathVariable RFQStatus status) {
        List<RFQ> rfqs = rfqService.getRFQsByStatus(status);
        return ResponseEntity.ok(rfqs);
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getTotalCount() {
        long count = rfqService.getTotalRFQCount();
        Map<String, Object> response = Map.of(
            "totalRFQs", count,
            "timestamp", java.time.LocalDateTime.now()
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = Map.of(
            "status", "UP",
            "module", "RFQ Management v7.0",
            "timestamp", java.time.LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(response);
    }
}
