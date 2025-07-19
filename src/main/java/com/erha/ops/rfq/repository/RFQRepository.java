package com.erha.ops.rfq.repository;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Enhanced RFQ Repository - All 26 endpoint queries
 * ERHA OPS v7.0 with safety and quality integration
 */
@Repository
public interface RFQRepository extends JpaRepository<RFQ, String> {
    
    // Basic CRUD
    Optional<RFQ> findByRfqNumberAndIsDeletedFalse(String rfqNumber);
    Page<RFQ> findByIsDeletedFalse(Pageable pageable);
    Optional<RFQ> findByRfqIdAndIsDeletedFalse(String rfqId);
    
    // Status queries
    Page<RFQ> findByStatusAndIsDeletedFalse(RFQStatus status, Pageable pageable);
    Page<RFQ> findByStatusInAndIsDeletedFalse(List<RFQStatus> statuses, Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    Page<RFQ> findActiveRFQs(Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.responseDueDate < :currentDate AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    List<RFQ> findOverdueRFQs(@Param("currentDate") LocalDateTime currentDate);
    
    // Assignment queries
    Page<RFQ> findByAssignedToUserIdAndIsDeletedFalse(String userId, Pageable pageable);
    Page<RFQ> findByAssignedToUserIdIsNullAndIsDeletedFalse(Pageable pageable);
    
    // Client queries
    Page<RFQ> findByClientNameContainingIgnoreCaseAndIsDeletedFalse(String clientName, Pageable pageable);
    List<RFQ> findByClientEmailAndIsDeletedFalse(String clientEmail);
    
    // Priority queries
    Page<RFQ> findByPriorityAndIsDeletedFalse(RFQPriority priority, Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.priority IN ('HIGH', 'URGENT', 'CRITICAL')")
    List<RFQ> findHighPriorityRFQs();
    
    // Project type queries
    Page<RFQ> findByProjectTypeAndIsDeletedFalse(ProjectType projectType, Pageable pageable);
    
    // ENHANCED: Safety and quality queries
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "(r.isoComplianceRequired = true OR r.qualityDocumentationNeeded = true OR " +
           "r.qualityRequirements IS NOT NULL)")
    Page<RFQ> findRFQsRequiringQualityAssessment(Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "(r.safetyRiskLevel != 'LOW' OR r.hazardAssessmentNeeded = true OR " +
           "r.specialSafetyEquipmentNeeded = true)")
    Page<RFQ> findRFQsRequiringSafetyAssessment(Pageable pageable);
    
    Page<RFQ> findBySafetyRiskLevelAndIsDeletedFalse(SafetyRiskLevel riskLevel, Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.safetyRiskLevel IN ('HIGH', 'CRITICAL', 'EXTREME')")
    List<RFQ> findHighRiskSafetyRFQs();
    
    Page<RFQ> findByIsoComplianceRequiredTrueAndIsDeletedFalse(Pageable pageable);
    
    // Search functionality
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "(LOWER(r.rfqNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.clientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.clientCompany) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<RFQ> searchRFQs(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Analytics queries
    @Query("SELECT r.status, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT r.priority, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.priority")
    List<Object[]> countByPriority();
    
    @Query("SELECT r.safetyRiskLevel, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.safetyRiskLevel")
    List<Object[]> countBySafetyRiskLevel();
    
    // Utility queries
    boolean existsByRfqNumberAndIsDeletedFalse(String rfqNumber);
    
    @Query("SELECT COUNT(r) FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    long countActiveRFQs();
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(r.rfqNumber, 4) AS int)), 0) + 1 " +
           "FROM RFQ r WHERE r.rfqNumber LIKE 'RFQ%'")
    Integer getNextRFQSequence();
}
