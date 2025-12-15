package com.erha.ops.repository;

import com.erha.ops.rfq.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RfqRepository extends JpaRepository<RFQ, Long> {
    RFQ findByJobNo(String jobNo);
}
