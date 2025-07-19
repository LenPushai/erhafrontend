package com.erha.ops.rfq.service;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.repository.RFQRepository;
import com.erha.ops.rfq.enums.RFQStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * RFQ Service - Simplified for initial testing
 */
@Service
@Transactional
public class RFQService {
    
    @Autowired
    private RFQRepository rfqRepository;
    
    public RFQ createRFQ(RFQ rfq) {
        rfq.setRfqId(UUID.randomUUID().toString());
        if (rfq.getRfqNumber() == null) {
            rfq.setRfqNumber(generateRFQNumber());
        }
        return rfqRepository.save(rfq);
    }
    
    @Transactional(readOnly = true)
    public Page<RFQ> getAllRFQs(Pageable pageable) {
        return rfqRepository.findByIsDeletedFalse(pageable);
    }
    
    @Transactional(readOnly = true)
    public Optional<RFQ> getRFQById(String rfqId) {
        return rfqRepository.findById(rfqId);
    }
    
        @Transactional(readOnly = true)
    public List<RFQ> getRFQsByStatus(RFQStatus status) {
        Pageable pageable = PageRequest.of(0, 100); // Default limit
        Page<RFQ> page = rfqRepository.findByStatusAndIsDeletedFalse(status, pageable);
        return page.getContent();
    }
    
    @Transactional(readOnly = true)
    public long getTotalRFQCount() {
        return rfqRepository.countActiveRFQs();
    }
    
    private String generateRFQNumber() {
        long count = rfqRepository.count();
        return String.format("RFQ%06d", count + 1);
    }
}


