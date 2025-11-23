package com.erha.ops.controller;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.enums.RfqStatus;
import com.erha.ops.rfq.repository.RFQRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class RfqController {

    private static final Logger logger = LoggerFactory.getLogger(RfqController.class);

    @Autowired
    private RFQRepository rfqRepository;

    @GetMapping("/rfqs")
    public ResponseEntity<Map<String, Object>> getAllRfqs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        logger.info("Fetching RFQs - page: {}, size: {}", page, size);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            Page<RFQ> rfqPage = rfqRepository.findAll(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", rfqPage.getContent());
            response.put("totalElements", rfqPage.getTotalElements());
            response.put("totalPages", rfqPage.getTotalPages());
            response.put("currentPage", page);

            logger.info("Found {} RFQs, total: {}", rfqPage.getContent().size(), rfqPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching RFQs: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/rfqs/status/{status}")
    public ResponseEntity<Map<String, Object>> getRfqsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Fetching RFQs by status: {}", status);

        try {
            RfqStatus rfqStatus = mapLegacyStatus(status);
            logger.info("Mapped '{}' to enum: {}", status, rfqStatus);

            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            Page<RFQ> rfqPage = rfqRepository.findByStatus(rfqStatus, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", rfqPage.getContent());
            response.put("totalElements", rfqPage.getTotalElements());
            response.put("totalPages", rfqPage.getTotalPages());
            response.put("currentPage", page);
            response.put("requestedStatus", status);
            response.put("mappedStatus", rfqStatus.toString());

            logger.info("Found {} RFQs with status {}", rfqPage.getContent().size(), rfqStatus);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid status '{}': {}", status, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + status));
        } catch (Exception e) {
            logger.error("Error fetching RFQs by status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/rfqs/{id}")
    public ResponseEntity<RFQ> getRfqById(@PathVariable Long id) {
        logger.info("Fetching RFQ by ID: {}", id);

        Optional<RFQ> rfq = rfqRepository.findById(id);
        if (rfq.isPresent()) {
            logger.info("Found RFQ: {}", rfq.get().getJobNo());
            return ResponseEntity.ok(rfq.get());
        } else {
            logger.warn("RFQ not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }


    // CREATE RFQ
    @PostMapping("/rfqs")
    public ResponseEntity<RFQ> createRfq(@RequestBody RFQ rfq) {
        logger.info("Creating new RFQ: {}", rfq.getJobNo());

        try {
            // Set defaults if not provided
            if (rfq.getCreatedAt() == null) {
                rfq.setCreatedAt(LocalDateTime.now());
            }
            if (rfq.getIsDeleted() == null) {
                rfq.setIsDeleted(false);
            }

            RFQ created = rfqRepository.save(rfq);
            logger.info("✅ Created RFQ: {} - {}", created.getJobNo(), created.getDescription());
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(created);

        } catch (Exception e) {
            logger.error("❌ Error creating RFQ: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // UPDATE RFQ (full update)
    @PutMapping("/rfqs/{id}")
    public ResponseEntity<RFQ> updateRfq(@PathVariable Long id, @RequestBody RFQ rfqDetails) {
        logger.info("Updating RFQ with ID: {}", id);

        try {
            Optional<RFQ> existingRfq = rfqRepository.findById(id);

            if (existingRfq.isEmpty()) {
                logger.warn("RFQ not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            RFQ rfq = existingRfq.get();

            // Update all fields
            if (rfqDetails.getJobNo() != null) rfq.setJobNo(rfqDetails.getJobNo());
            if (rfqDetails.getDescription() != null) rfq.setDescription(rfqDetails.getDescription());
            if (rfqDetails.getDepartment() != null) rfq.setDepartment(rfqDetails.getDepartment());
            if (rfqDetails.getEstimatedValue() != null) rfq.setEstimatedValue(rfqDetails.getEstimatedValue());
            if (rfqDetails.getStatus() != null) rfq.setStatus(rfqDetails.getStatus());
            if (rfqDetails.getRequiredDate() != null) rfq.setRequiredDate(rfqDetails.getRequiredDate());
            if (rfqDetails.getAssignedTo() != null) rfq.setAssignedTo(rfqDetails.getAssignedTo());
            if (rfqDetails.getIsDeleted() != null) rfq.setIsDeleted(rfqDetails.getIsDeleted());

            RFQ updatedRfq = rfqRepository.save(rfq);
            logger.info("✅ Updated RFQ: {} - {}", updatedRfq.getJobNo(), updatedRfq.getDescription());
            return ResponseEntity.ok(updatedRfq);

        } catch (Exception e) {
            logger.error("❌ Error updating RFQ: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PARTIAL UPDATE RFQ (for reassign, status changes, etc.)
    @PatchMapping("/rfqs/{id}")
    public ResponseEntity<RFQ> partialUpdateRfq(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        logger.info("Partial update RFQ with ID: {} - Fields: {}", id, updates.keySet());

        try {
            Optional<RFQ> existingRfq = rfqRepository.findById(id);

            if (existingRfq.isEmpty()) {
                logger.warn("RFQ not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            RFQ rfq = existingRfq.get();

            // Update only provided fields
            if (updates.containsKey("jobNo")) {
                rfq.setJobNo((String) updates.get("jobNo"));
            }
            if (updates.containsKey("description")) {
                rfq.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("department")) {
                rfq.setDepartment((String) updates.get("department"));
            }
            if (updates.containsKey("estimatedValue")) {
                Object value = updates.get("estimatedValue");
                rfq.setEstimatedValue(new BigDecimal(value.toString()));
            }
            if (updates.containsKey("status")) {
                String statusStr = (String) updates.get("status");
                rfq.setStatus(RfqStatus.valueOf(statusStr.toUpperCase()));
            }
            if (updates.containsKey("requiredDate")) {
                String dateStr = (String) updates.get("requiredDate");
                rfq.setRequiredDate(LocalDate.parse(dateStr));
            }
            if (updates.containsKey("assignedTo")) {
                rfq.setAssignedTo((String) updates.get("assignedTo"));
                logger.info("🔄 Reassigning RFQ {} to: {}", rfq.getJobNo(), updates.get("assignedTo"));
            }
            if (updates.containsKey("isDeleted")) {
                rfq.setIsDeleted((Boolean) updates.get("isDeleted"));
            }

            RFQ updatedRfq = rfqRepository.save(rfq);
            logger.info("✅ Partial update successful for RFQ: {}", updatedRfq.getJobNo());
            return ResponseEntity.ok(updatedRfq);

        } catch (Exception e) {
            logger.error("❌ Error in partial update: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE RFQ (soft delete)
    @DeleteMapping("/rfqs/{id}")
    public ResponseEntity<Map<String, Object>> deleteRfq(@PathVariable Long id) {
        logger.info("Deleting RFQ with ID: {}", id);

        try {
            Optional<RFQ> existingRfq = rfqRepository.findById(id);

            if (existingRfq.isEmpty()) {
                logger.warn("RFQ not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            RFQ rfq = existingRfq.get();
            rfq.setIsDeleted(true);
            rfqRepository.save(rfq);

            logger.info("✅ Soft deleted RFQ: {}", rfq.getJobNo());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "RFQ soft deleted successfully");
            response.put("rfqId", id);
            response.put("jobNo", rfq.getJobNo());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("❌ Error deleting RFQ: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug/rfqs/raw")
    public ResponseEntity<List<RFQ>> getRawRfqs() {
        logger.info("Debug: Fetching raw RFQs (no pagination)");
        List<RFQ> rfqs = rfqRepository.findAll();
        logger.info("Debug: Found {} total RFQs", rfqs.size());
        return ResponseEntity.ok(rfqs);
    }

    @PostMapping("/debug/seed-data")
    public ResponseEntity<Map<String, Object>> seedTestData() {
        logger.info("Seeding test data from real ERHA records");

        Map<String, Object> result = new HashMap<>();
        List<RFQ> createdRfqs = new ArrayList<>();

        try {
            Object[][] rfqData = {
                    {"24-003", "SERVICE & REPAIR", 0, RfqStatus.SUBMITTED, "PRODUCTION"},
                    {"SH24-002", "EBT TURRET", 138620, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"SH24-001", "DO COMPLETE SERVICE ON EAF CRADLE", 104276, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"24-004", "SERVICE & REPAIR", 0, RfqStatus.SUBMITTED, "PRODUCTION"},
                    {"SH24-005", "ROOF SLEW", 99128, RfqStatus.READY_FOR_QUOTE, "ENGINEERING"},
                    {"SH24-004", "EAF VERTICAL STRUCTURE", 56425, RfqStatus.READY_FOR_QUOTE, "ENGINEERING"},
                    {"24-002", "ME43 LIFTING FINGER COMPLETE", 0, RfqStatus.SUBMITTED, "PRODUCTION"},
                    {"SH24-003", "ELECTRODE ARM #2 & MAST #2", 117186, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"SH24-006", "ELECTRODE ARM #1 & MAST #1", 117186, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"24-005", "SERVICE & REPAIR", 0, RfqStatus.COMPLETED, "PRODUCTION"},
                    {"24-007", "SERVICE & REPAIR: P7-10-1-1", 0, RfqStatus.UNDER_REVIEW, "PRODUCTION"},
                    {"SH24-007", "ELECTRODE ARM #3 & MAST #3", 117186, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"24-001", "MANUFACTURE STOPPER GUIDE BLOCK", 75000, RfqStatus.QUOTED, "ENGINEERING"},
                    {"24-008", "REVISE COMPRESSOR ROOM DRAWINGS", 25000, RfqStatus.UNDER_REVIEW, "ENGINEERING"},
                    {"SH24-008", "FURNACE REFRACTORY REPAIR", 89500, RfqStatus.READY_FOR_QUOTE, "MAINTENANCE"},
                    {"24-009", "HYDRAULIC CYLINDER REBUILD", 45000, RfqStatus.SUBMITTED, "PRODUCTION"},
                    {"SH24-009", "TRANSFORMER MAINTENANCE", 67500, RfqStatus.READY_FOR_QUOTE, "ENGINEERING"},
                    {"24-010", "BEARING REPLACEMENT", 12500, RfqStatus.COMPLETED, "MAINTENANCE"},
                    {"SH24-010", "COOLING SYSTEM UPGRADE", 156000, RfqStatus.QUOTED, "ENGINEERING"},
                    {"24-011", "SAFETY VALVE INSPECTION", 8500, RfqStatus.UNDER_REVIEW, "PRODUCTION"}
            };

            for (Object[] data : rfqData) {
                String jobNo = (String) data[0];
                String description = (String) data[1];
                Integer estimatedValue = (Integer) data[2];
                RfqStatus status = (RfqStatus) data[3];
                String department = (String) data[4];

                RFQ existingRfq = rfqRepository.findByJobNo(jobNo);
                if (existingRfq != null) {
                    logger.info("RFQ {} already exists, skipping", jobNo);
                    continue;
                }

                RFQ rfq = new RFQ();
                rfq.setJobNo(jobNo);
                rfq.setDescription(description);
                rfq.setEstimatedValue(new BigDecimal(estimatedValue));
                rfq.setStatus(status);
                rfq.setDepartment(department);
                rfq.setIsDeleted(false);
                rfq.setCreatedAt(LocalDateTime.now().minusDays((long)(Math.random() * 30)));
                rfq.setRequiredDate(LocalDate.now().plusDays((long)(Math.random() * 90 + 30)));

                RFQ saved = rfqRepository.save(rfq);
                createdRfqs.add(saved);

                logger.info("Created RFQ: {} - {} - R{}", saved.getJobNo(), saved.getStatus(), saved.getEstimatedValue());
            }

            result.put("success", true);
            result.put("message", "Test data seeded successfully");
            result.put("recordsCreated", createdRfqs.size());
            result.put("totalRecordsAttempted", rfqData.length);
            result.put("createdRfqs", createdRfqs.stream().map(rfq -> Map.of(
                    "id", rfq.getId(),
                    "jobNo", rfq.getJobNo(),
                    "status", rfq.getStatus().toString(),
                    "estimatedValue", rfq.getEstimatedValue()
            )).toList());

            Map<String, Long> statusCounts = createdRfqs.stream()
                    .collect(Collectors.groupingBy(rfq -> rfq.getStatus().toString(), Collectors.counting()));
            result.put("statusDistribution", statusCounts);

            BigDecimal totalValue = createdRfqs.stream()
                    .map(RFQ::getEstimatedValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.put("totalValue", totalValue);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error seeding test data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("recordsCreated", createdRfqs.size());
            return ResponseEntity.ok(result);
        }
    }

    @PostMapping("/debug/seed-simple")
    public ResponseEntity<Map<String, Object>> seedSimpleData() {
        logger.info("Seeding simple test data with short status values");

        Map<String, Object> result = new HashMap<>();
        List<RFQ> createdRfqs = new ArrayList<>();

        try {
            Object[][] rfqData = {
                    {"SH24-001", "EBT TURRET MAINTENANCE", 138620, RfqStatus.SUBMITTED, "MAINTENANCE"},
                    {"SH24-002", "EAF CRADLE SERVICE", 104276, RfqStatus.SUBMITTED, "MAINTENANCE"},
                    {"24-001", "ELECTRODE ARM REPAIR", 117186, RfqStatus.DRAFT, "MAINTENANCE"},
                    {"24-002", "LIFTING FINGER REPLACEMENT", 45000, RfqStatus.SUBMITTED, "PRODUCTION"},
                    {"SH24-003", "ROOF SLEW MAINTENANCE", 99128, RfqStatus.DRAFT, "ENGINEERING"},
                    {"24-003", "HYDRAULIC CYLINDER REBUILD", 56425, RfqStatus.COMPLETED, "PRODUCTION"},
                    {"SH24-004", "TRANSFORMER SERVICE", 67500, RfqStatus.SUBMITTED, "ENGINEERING"},
                    {"24-004", "BEARING REPLACEMENT", 12500, RfqStatus.COMPLETED, "MAINTENANCE"},
                    {"SH24-005", "COOLING SYSTEM UPGRADE", 156000, RfqStatus.DRAFT, "ENGINEERING"},
                    {"24-005", "SAFETY VALVE INSPECTION", 8500, RfqStatus.SUBMITTED, "PRODUCTION"}
            };

            for (Object[] data : rfqData) {
                String jobNo = (String) data[0];
                String description = (String) data[1];
                Integer estimatedValue = (Integer) data[2];
                RfqStatus status = (RfqStatus) data[3];
                String department = (String) data[4];

                RFQ existingRfq = rfqRepository.findByJobNo(jobNo);
                if (existingRfq != null) {
                    logger.info("RFQ {} already exists, skipping", jobNo);
                    continue;
                }

                RFQ rfq = new RFQ();
                rfq.setJobNo(jobNo);
                rfq.setDescription(description);
                rfq.setEstimatedValue(new BigDecimal(estimatedValue));
                rfq.setStatus(status);
                rfq.setDepartment(department);
                rfq.setIsDeleted(false);
                rfq.setCreatedAt(LocalDateTime.now().minusDays((long)(Math.random() * 30)));
                rfq.setRequiredDate(LocalDate.now().plusDays((long)(Math.random() * 90 + 30)));

                RFQ saved = rfqRepository.save(rfq);
                createdRfqs.add(saved);

                logger.info("Created RFQ: {} - {} - R{}", saved.getJobNo(), saved.getStatus(), saved.getEstimatedValue());
            }

            result.put("success", true);
            result.put("message", "Simple test data seeded successfully");
            result.put("recordsCreated", createdRfqs.size());
            result.put("totalRecordsAttempted", rfqData.length);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error seeding simple test data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("recordsCreated", createdRfqs.size());
            return ResponseEntity.ok(result);
        }
    }

    private RfqStatus mapLegacyStatus(String status) {
        return switch (status.toUpperCase()) {
            case "APPROVED" -> RfqStatus.READY_FOR_QUOTE;
            case "PENDING" -> RfqStatus.SUBMITTED;
            case "IN_PROGRESS" -> RfqStatus.UNDER_REVIEW;
            case "COMPLETED" -> RfqStatus.COMPLETED;
            default -> RfqStatus.valueOf(status.toUpperCase());
        };
    }
}