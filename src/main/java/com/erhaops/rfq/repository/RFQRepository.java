package com.erhaops.rfq.repository;

import com.erhaops.rfq.entity.RFQ;
import com.erhaops.rfq.enums.*;
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
 * RFQ Repository Interface
 * ENHANCED: Comprehensive data access for ERHA OPS v7.0
 * Includes safety and quality filtering capabilities
 */
@Repository
public interface RFQRepository extends JpaRepository<RFQ, String> {
    
    // ===== BASIC CRUD OPERATIONS =====
    Optional<RFQ> findByRfqNumberAndIsDeletedFalse(String rfqNumber);
    Page<RFQ> findByIsDeletedFalse(Pageable pageable);
    Optional<RFQ> findByRfqIdAndIsDeletedFalse(String rfqId);
    
    // ===== STATUS AND WORKFLOW QUERIES =====
    Page<RFQ> findByStatusAndIsDeletedFalse(RFQStatus status, Pageable pageable);
    Page<RFQ> findByStatusInAndIsDeletedFalse(List<RFQStatus> statuses, Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    Page<RFQ> findActiveRFQs(Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.responseDueDate < :currentDate AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    List<RFQ> findOverdueRFQs(@Param("currentDate") LocalDateTime currentDate);
    
    // ===== ASSIGNMENT AND USER QUERIES =====
    Page<RFQ> findByAssignedToUserIdAndIsDeletedFalse(String userId, Pageable pageable);
    Page<RFQ> findByCreatedByUserIdAndIsDeletedFalse(String userId, Pageable pageable);
    Page<RFQ> findByAssignedToUserIdIsNullAndIsDeletedFalse(Pageable pageable);
    
    // ===== CLIENT QUERIES =====
    Page<RFQ> findByClientNameContainingIgnoreCaseAndIsDeletedFalse(String clientName, Pageable pageable);
    Page<RFQ> findByClientCompanyContainingIgnoreCaseAndIsDeletedFalse(String clientCompany, Pageable pageable);
    List<RFQ> findByClientEmailAndIsDeletedFalse(String clientEmail);
    
    // ===== PRIORITY AND PROJECT TYPE QUERIES =====
    Page<RFQ> findByPriorityAndIsDeletedFalse(RFQPriority priority, Pageable pageable);
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.priority IN ('HIGH', 'URGENT', 'CRITICAL')")
    List<RFQ> findHighPriorityRFQs();
    
    Page<RFQ> findByProjectTypeAndIsDeletedFalse(ProjectType projectType, Pageable pageable);
    
    // ===== ENHANCED: SAFETY AND QUALITY QUERIES =====
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
    
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.workshopAreasInvolved LIKE %:area%")
    Page<RFQ> findByWorkshopAreaInvolved(@Param("area") String area, Pageable pageable);
    
    // ===== SEARCH AND ANALYTICS =====
    @Query("SELECT r FROM RFQ r WHERE r.isDeleted = false AND " +
           "(LOWER(r.rfqNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.clientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.clientCompany) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<RFQ> searchRFQs(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT r.status, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT r.priority, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.priority")
    List<Object[]> countByPriority();
    
    @Query("SELECT r.safetyRiskLevel, COUNT(r) FROM RFQ r WHERE r.isDeleted = false GROUP BY r.safetyRiskLevel")
    List<Object[]> countBySafetyRiskLevel();
    
    // ===== UTILITY QUERIES =====
    boolean existsByRfqNumberAndIsDeletedFalse(String rfqNumber);
    
    @Query("SELECT COUNT(r) FROM RFQ r WHERE r.isDeleted = false AND " +
           "r.status NOT IN ('CONVERTED', 'DECLINED', 'EXPIRED', 'CANCELLED')")
    long countActiveRFQs();
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(r.rfqNumber, 4) AS int)), 0) + 1 " +
           "FROM RFQ r WHERE r.rfqNumber LIKE 'RFQ%'")
    Integer getNextRFQSequence();
}
