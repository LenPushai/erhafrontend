package com.erha.ops.rfq.service;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.enums.RfqStatus;
import com.erha.ops.rfq.repository.RFQRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RFQService {

    private static final Logger logger = LoggerFactory.getLogger(RFQService.class);

    @Autowired
    private RFQRepository rfqRepository;

    public Page<RFQ> getAllRfqs(Pageable pageable) {
        logger.info("🔍 Service: Fetching all RFQs with pagination");
        return rfqRepository.findAll(pageable);
    }

    public Page<RFQ> getRfqsByStatus(String statusString, Pageable pageable) {
        logger.info("🔍 Service: Fetching RFQs by status string: {}", statusString);

        try {
            // Convert string to enum with legacy mapping
            RfqStatus status = mapLegacyStatusToEnum(statusString);
            logger.info("✅ Service: Mapped '{}' to enum: {}", statusString, status);

            return rfqRepository.findByStatus(status, pageable);
        } catch (IllegalArgumentException e) {
            logger.error("❌ Service: Invalid status string '{}': {}", statusString, e.getMessage());
            throw new IllegalArgumentException("Invalid RFQ status: " + statusString, e);
        }
    }

    public Page<RFQ> getRfqsByStatus(RfqStatus status, Pageable pageable) {
        logger.info("🔍 Service: Fetching RFQs by enum status: {}", status);
        return rfqRepository.findByStatus(status, pageable);
    }

    public Optional<RFQ> getRfqById(Long id) {
        logger.info("🎯 Service: Fetching RFQ by ID: {}", id);
        return rfqRepository.findById(id);
    }

    public RFQ getRfqByJobNo(String jobNo) {
        logger.info("🎯 Service: Fetching RFQ by Job No: {}", jobNo);
        return rfqRepository.findByJobNo(jobNo);
    }

    public RFQ saveRfq(RFQ rfq) {
        logger.info("💾 Service: Saving RFQ: {}", rfq.getJobNo());
        return rfqRepository.save(rfq);
    }

    public RFQ createRfq(RFQ rfq) {
        logger.info("🆕 Service: Creating new RFQ: {}", rfq.getJobNo());
        // Set default status if not provided
        if (rfq.getStatus() == null) {
            rfq.setStatus(RfqStatus.DRAFT);
        }
        return rfqRepository.save(rfq);
    }

    public RFQ updateRfqStatus(Long id, String statusString) {
        logger.info("🔄 Service: Updating RFQ {} status to: {}", id, statusString);

        Optional<RFQ> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found with id: " + id);
        }

        RFQ rfq = rfqOpt.get();
        RfqStatus newStatus = mapLegacyStatusToEnum(statusString);
        rfq.setStatus(newStatus);

        logger.info("✅ Service: Status updated from {} to {}", rfq.getStatus(), newStatus);
        return rfqRepository.save(rfq);
    }

    public RFQ updateRfqStatus(Long id, RfqStatus status) {
        logger.info("🔄 Service: Updating RFQ {} status to enum: {}", id, status);

        Optional<RFQ> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isEmpty()) {
            throw new RuntimeException("RFQ not found with id: " + id);
        }

        RFQ rfq = rfqOpt.get();
        RfqStatus oldStatus = rfq.getStatus();
        rfq.setStatus(status);

        logger.info("✅ Service: Status updated from {} to {}", oldStatus, status);
        return rfqRepository.save(rfq);
    }

    public void deleteRfq(Long id) {
        logger.info("🗑️ Service: Soft deleting RFQ: {}", id);

        Optional<RFQ> rfqOpt = rfqRepository.findById(id);
        if (rfqOpt.isPresent()) {
            RFQ rfq = rfqOpt.get();
            rfq.setIsDeleted(true);
            rfqRepository.save(rfq);
            logger.info("✅ Service: RFQ {} marked as deleted", id);
        } else {
            throw new RuntimeException("RFQ not found with id: " + id);
        }
    }

    public long getTotalRfqCount() {
        return rfqRepository.count();
    }

    public long getActiveRfqCount() {
        // Count RFQs that are not deleted and have active statuses
        Page<RFQ> activePage = rfqRepository.findAllActive(Pageable.unpaged());
        return activePage.getTotalElements();
    }

    // Helper method for legacy status mapping
    private RfqStatus mapLegacyStatusToEnum(String statusString) {
        if (statusString == null) {
            return RfqStatus.DRAFT;
        }

        // Handle legacy mappings first
        return switch (statusString.toUpperCase().trim()) {
            case "APPROVED" -> RfqStatus.READY_FOR_QUOTE;
            case "PENDING" -> RfqStatus.SUBMITTED;
            case "IN_PROGRESS" -> RfqStatus.UNDER_REVIEW;
            case "COMPLETED" -> RfqStatus.COMPLETED;
            case "DRAFT" -> RfqStatus.DRAFT;
            case "SUBMITTED" -> RfqStatus.SUBMITTED;
            case "UNDER_REVIEW" -> RfqStatus.UNDER_REVIEW;
            case "QUALITY_ASSESSMENT" -> RfqStatus.QUALITY_ASSESSMENT;
            case "SAFETY_ASSESSMENT" -> RfqStatus.SAFETY_ASSESSMENT;
            case "PENDING_CLARIFICATION" -> RfqStatus.PENDING_CLARIFICATION;
            case "READY_FOR_QUOTE" -> RfqStatus.READY_FOR_QUOTE;
            case "QUOTED" -> RfqStatus.QUOTED;
            case "INVOICED" -> RfqStatus.INVOICED;
            case "CONVERTED" -> RfqStatus.CONVERTED;
            case "DECLINED" -> RfqStatus.DECLINED;
            case "EXPIRED" -> RfqStatus.EXPIRED;
            case "ON_HOLD" -> RfqStatus.ON_HOLD;
            case "CANCELLED" -> RfqStatus.CANCELLED;
            default -> {
                logger.warn("⚠️ Service: Unknown status '{}', defaulting to DRAFT", statusString);
                yield RfqStatus.DRAFT;
            }
        };
    }
}