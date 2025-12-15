package com.erha.ops.repository;

import com.erha.ops.entity.NumberingSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface NumberingSequenceRepository extends JpaRepository<NumberingSequence, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ns FROM NumberingSequence ns WHERE ns.sequenceType = :sequenceType")
    Optional<NumberingSequence> findBySequenceTypeWithLock(@Param("sequenceType") String sequenceType);
    
    Optional<NumberingSequence> findBySequenceType(String sequenceType);
}