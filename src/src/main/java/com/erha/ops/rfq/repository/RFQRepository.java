package com.erha.ops.rfq.repository;

import com.erha.ops.rfq.entity.RFQ;
import com.erha.ops.rfq.enums.RfqStatus;  // FIXED: Import from enums package, not entity
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RFQRepository extends JpaRepository<RFQ, Long> {

    @Query("SELECT r FROM RFQ r WHERE r.status = :status AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    Page<RFQ> findByStatus(@Param("status") RfqStatus status, Pageable pageable);

    @Query("SELECT r FROM RFQ r WHERE r.jobNo = :jobNo AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    RFQ findByJobNo(@Param("jobNo") String jobNo);

    @Query("SELECT r FROM RFQ r WHERE (r.isDeleted = false OR r.isDeleted IS NULL)")
    Page<RFQ> findAllActive(Pageable pageable);
}