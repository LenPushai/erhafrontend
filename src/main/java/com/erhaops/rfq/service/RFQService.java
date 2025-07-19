package com.erhaops.rfq.service;

import com.erhaops.rfq.entity.RFQ;
import com.erhaops.rfq.repository.RFQRepository;
import com.erhaops.rfq.enums.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * RFQ Service - Business Logic Layer
 * ENHANCED: Comprehensive RFQ management with safety and quality integration
 * Maintains ERHA's zero-incident safety record and ISO 9001 compliance
 */
@Service
@Transactional
public class RFQService {
    
    @Autowired
    private RFQRepository rfqRepository;
    
    // ===== CORE RFQ OPERATIONS =====
    
    /**
     * Create new RFQ with automatic number generation
     */
    public RFQ createRFQ(RFQ rfq) {
        // Generate UUID and RFQ number
        rfq.setRfqId(UUID.randomUUID().toString());
        if (rfq.getRfqNumber() == null || rfq.getRfqNumber().isEmpty()) {
            rfq.setRfqNumber(generateRFQNumber());
        }
        
        // Set defaults
        rfq.setCreatedAt(LocalDateTime.now());
        rfq.setReceivedDate(LocalDateTime.now());
        rfq.setStatus(RFQStatus.DRAFT);
        rfq.setIsDeleted(false);
        
        // Auto-assess safety and quality requirements
        autoAssessRequirements(rfq);
        
        return rfqRepository.save(rfq);
    }
    
    /**
     * Update existing RFQ
     */
    public RFQ updateRFQ(String rfqId, RFQ updatedRFQ) {
        Optional<RFQ> existingRFQ = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (existingRFQ.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = existingRFQ.get();
        updateRFQFields(rfq, updatedRFQ);
        rfq.setUpdatedAt(LocalDateTime.now());
        
        // Re-assess safety and quality requirements
        autoAssessRequirements(rfq);
        
        return rfqRepository.save(rfq);
    }
    
    /**
     * Get RFQ by ID
     */
    @Transactional(readOnly = true)
    public Optional<RFQ> getRFQById(String rfqId) {
        return rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
    }
    
    /**
     * Get RFQ by number
     */
    @Transactional(readOnly = true)
    public Optional<RFQ> getRFQByNumber(String rfqNumber) {
        return rfqRepository.findByRfqNumberAndIsDeletedFalse(rfqNumber);
    }
    
    /**
     * Get all RFQs with pagination
     */
    @Transactional(readOnly = true)
    public Page<RFQ> getAllRFQs(Pageable pageable) {
        return rfqRepository.findByIsDeletedFalse(pageable);
    }
    
    /**
     * Soft delete RFQ
     */
    public void deleteRFQ(String rfqId, String deletedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isPresent()) {
            RFQ rfq = rfqOpt.get();
            rfq.softDelete(deletedByUserId);
            rfqRepository.save(rfq);
        }
    }
    
    // ===== WORKFLOW OPERATIONS =====
    
    /**
     * Update RFQ status with validation
     */
    public RFQ updateStatus(String rfqId, RFQStatus newStatus, String updatedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = rfqOpt.get();
        validateStatusTransition(rfq.getStatus(), newStatus);
        
        rfq.setStatus(newStatus);
        rfq.setUpdatedAt(LocalDateTime.now());
        rfq.setUpdatedByUserId(updatedByUserId);
        
        return rfqRepository.save(rfq);
    }
    
    /**
     * Convert RFQ to Quote
     */
    public RFQ convertToQuote(String rfqId, String quoteId, String convertedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = rfqOpt.get();
        if (!rfq.getStatus().canBeConverted()) {
            throw new RuntimeException("RFQ cannot be converted in current status: " + rfq.getStatus());
        }
        
        rfq.markAsConverted(quoteId);
        rfq.setUpdatedByUserId(convertedByUserId);
        
        return rfqRepository.save(rfq);
    }
    
    /**
     * Assign RFQ to user
     */
    public RFQ assignRFQ(String rfqId, String assignedToUserId, String assignedToName, String assignedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = rfqOpt.get();
        rfq.setAssignedToUserId(assignedToUserId);
        rfq.setAssignedToName(assignedToName);
        rfq.setUpdatedAt(LocalDateTime.now());
        rfq.setUpdatedByUserId(assignedByUserId);
        
        return rfqRepository.save(rfq);
    }
    
    // ===== ENHANCED: SAFETY AND QUALITY OPERATIONS =====
    
    /**
     * Update safety assessment
     */
    public RFQ updateSafetyAssessment(String rfqId, SafetyRiskLevel riskLevel, 
                                     String safetyRequirements, Boolean hazardAssessmentNeeded,
                                     Boolean specialEquipmentNeeded, String updatedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = rfqOpt.get();
        rfq.setSafetyRiskLevel(riskLevel);
        rfq.setSafetyRequirements(safetyRequirements);
        rfq.setHazardAssessmentNeeded(hazardAssessmentNeeded);
        rfq.setSpecialSafetyEquipmentNeeded(specialEquipmentNeeded);
        rfq.setUpdatedAt(LocalDateTime.now());
        rfq.setUpdatedByUserId(updatedByUserId);
        
        // Auto-update status if high risk
        if (riskLevel.requiresSpecialApproval() && rfq.getStatus() == RFQStatus.UNDER_REVIEW) {
            rfq.setStatus(RFQStatus.SAFETY_ASSESSMENT);
        }
        
        return rfqRepository.save(rfq);
    }
    
    /**
     * Update quality requirements
     */
    public RFQ updateQualityRequirements(String rfqId, String qualityRequirements,
                                        Boolean isoComplianceRequired, String clientQualityStandards,
                                        Boolean qualityDocumentationNeeded, String updatedByUserId) {
        Optional<RFQ> rfqOpt = rfqRepository.findByRfqIdAndIsDeletedFalse(rfqId);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found: " + rfqId);
        }
        
        RFQ rfq = rfqOpt.get();
        rfq.setQualityRequirements(qualityRequirements);
        rfq.setIsoComplianceRequired(isoComplianceRequired);
        rfq.setClientQualityStandards(clientQualityStandards);
        rfq.setQualityDocumentationNeeded(qualityDocumentationNeeded);
        rfq.setUpdatedAt(LocalDateTime.now());
        rfq.setUpdatedByUserId(updatedByUserId);
        
        // Auto-update status if quality assessment needed
        if (rfq.requiresQualityAssessment() && rfq.getStatus() == RFQStatus.UNDER_REVIEW) {
            rfq.setStatus(RFQStatus.QUALITY_ASSESSMENT);
        }
        
        return rfqRepository.save(rfq);
    }
    
    // ===== QUERY OPERATIONS =====
    
    @Transactional(readOnly = true)
    public Page<RFQ> getRFQsByStatus(RFQStatus status, Pageable pageable) {
        return rfqRepository.findByStatusAndIsDeletedFalse(status, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<RFQ> getRFQsByPriority(RFQPriority priority, Pageable pageable) {
        return rfqRepository.findByPriorityAndIsDeletedFalse(priority, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<RFQ> getRFQsRequiringSafetyAssessment(Pageable pageable) {
        return rfqRepository.findRFQsRequiringSafetyAssessment(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<RFQ> getRFQsRequiringQualityAssessment(Pageable pageable) {
        return rfqRepository.findRFQsRequiringQualityAssessment(pageable);
    }
    
    @Transactional(readOnly = true)
    public List<RFQ> getOverdueRFQs() {
        return rfqRepository.findOverdueRFQs(LocalDateTime.now());
    }
    
    @Transactional(readOnly = true)
    public List<RFQ> getHighPriorityRFQs() {
        return rfqRepository.findHighPriorityRFQs();
    }
    
    @Transactional(readOnly = true)
    public Page<RFQ> searchRFQs(String searchTerm, Pageable pageable) {
        return rfqRepository.searchRFQs(searchTerm, pageable);
    }
    
    // ===== HELPER METHODS =====
    
    private String generateRFQNumber() {
        Integer nextSequence = rfqRepository.getNextRFQSequence();
        return String.format("RFQ%06d", nextSequence);
    }
    
    private void autoAssessRequirements(RFQ rfq) {
        // Auto-detect safety requirements based on project type
        if (rfq.getProjectType() != null && rfq.getProjectType().requiresSpecialSafety()) {
            rfq.setSafetyRiskLevel(SafetyRiskLevel.MEDIUM);
            rfq.setHazardAssessmentNeeded(true);
        }
        
        // Auto-detect quality requirements based on project type
        if (rfq.getProjectType() != null && rfq.getProjectType().requiresISO9001()) {
            rfq.setIsoComplianceRequired(true);
            rfq.setQualityDocumentationNeeded(true);
        }
    }
    
    private void validateStatusTransition(RFQStatus currentStatus, RFQStatus newStatus) {
        // Define valid status transitions based on business rules
        // This is a simplified version - implement full state machine logic
        if (currentStatus == RFQStatus.CONVERTED && newStatus != RFQStatus.CONVERTED) {
            throw new RuntimeException("Cannot change status of converted RFQ");
        }
        
        if (currentStatus == RFQStatus.CANCELLED && newStatus != RFQStatus.CANCELLED) {
            throw new RuntimeException("Cannot change status of cancelled RFQ");
        }
    }
    
    private void updateRFQFields(RFQ existing, RFQ updated) {
        // Update only non-null fields from updated RFQ
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getClientName() != null) existing.setClientName(updated.getClientName());
        if (updated.getClientEmail() != null) existing.setClientEmail(updated.getClientEmail());
        if (updated.getClientPhone() != null) existing.setClientPhone(updated.getClientPhone());
        if (updated.getClientCompany() != null) existing.setClientCompany(updated.getClientCompany());
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getProjectType() != null) existing.setProjectType(updated.getProjectType());
        if (updated.getEstimatedValue() != null) existing.setEstimatedValue(updated.getEstimatedValue());
        if (updated.getResponseDueDate() != null) existing.setResponseDueDate(updated.getResponseDueDate());
        if (updated.getProjectStartDate() != null) existing.setProjectStartDate(updated.getProjectStartDate());
        if (updated.getProjectEndDate() != null) existing.setProjectEndDate(updated.getProjectEndDate());
        // Add more field updates as needed...
    }
}
