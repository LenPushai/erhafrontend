package com.erha.ops.repository;

import com.erha.ops.entity.Worker;
import com.erha.ops.entity.Worker.WorkerStatus;
import com.erha.ops.entity.Worker.WorkerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    
    // Find by employee code
    Optional<Worker> findByEmployeeCode(String employeeCode);
    
    // Find by clock number
    Optional<Worker> findByClockNo(String clockNo);
    
    // Find by status
    List<Worker> findByStatus(WorkerStatus status);
    
    // Find by worker type
    List<Worker> findByWorkerType(WorkerType workerType);
    
    // Find by department
    List<Worker> findByDepartment(String department);
    
    // Find by status and type
    List<Worker> findByStatusAndWorkerType(WorkerStatus status, WorkerType workerType);
    
    // Search workers
    @Query("SELECT w FROM Worker w WHERE " +
           "LOWER(w.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.clockNo) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Worker> searchWorkers(@Param("search") String search);
    
    // Count by status
    long countByStatus(WorkerStatus status);
    
    // Count by worker type
    long countByWorkerType(WorkerType workerType);
}