package com.erha.ops.rfq.service;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.enums.RfqStatus;
import com.erha.ops.rfq.repository.RFQRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class RFQService {

    private final RFQRepository rfqRepository;

    public RFQService(RFQRepository rfqRepository) {
        this.rfqRepository = rfqRepository;
    }

    public Map<String, Object> getAllRfqs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<RFQ> rfqPage = rfqRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", rfqPage.getContent());
        response.put("totalElements", rfqPage.getTotalElements());
        response.put("totalPages", rfqPage.getTotalPages());
        response.put("currentPage", page);

        return response;
    }

    public Map<String, Object> getRfqsByStatus(String status, int page, int size) {
        RfqStatus rfqStatus = RfqStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<RFQ> rfqPage = rfqRepository.findByStatus(rfqStatus, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", rfqPage.getContent());
        response.put("totalElements", rfqPage.getTotalElements());
        response.put("totalPages", rfqPage.getTotalPages());
        response.put("currentPage", page);

        return response;
    }

    public RFQ getRfqById(Long id) {
        return rfqRepository.findById(id).orElse(null);
    }

    public RFQ createRfq(RFQ rfq) {
        return rfqRepository.save(rfq);
    }

    public RFQ updateRfq(Long id, RFQ rfqDetails) {
        RFQ rfq = rfqRepository.findById(id).orElseThrow();
        
        rfq.setJobNo(rfqDetails.getJobNo());
        rfq.setDescription(rfqDetails.getDescription());
        rfq.setDepartment(rfqDetails.getDepartment());
        rfq.setEstimatedValue(rfqDetails.getEstimatedValue());
        rfq.setStatus(rfqDetails.getStatus());
        rfq.setRequiredDate(rfqDetails.getRequiredDate());
        
        return rfqRepository.save(rfq);
    }

    public void deleteRfq(Long id) {
        rfqRepository.deleteById(id);
    }

    /*public List<RFQ> searchRfqs(String query) {
        return rfqRepository.findByJobNoContainingOrDescriptionContaining(query, query);
    }*/
}

