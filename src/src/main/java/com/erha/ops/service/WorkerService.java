package com.erha.ops.service;

import com.erha.ops.entity.Worker;
import com.erha.ops.entity.Worker.WorkerStatus;
import com.erha.ops.entity.Worker.WorkerType;
import com.erha.ops.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WorkerService {
    
    @Autowired
    private WorkerRepository workerRepository;
    
    // Get all workers
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }
    
    // Get worker by ID
    public Optional<Worker> getWorkerById(Long id) {
        return workerRepository.findById(id);
    }
    
    // Get worker by employee code
    public Optional<Worker> getWorkerByEmployeeCode(String employeeCode) {
        return workerRepository.findByEmployeeCode(employeeCode);
    }
    
    // Get worker by clock number
    public Optional<Worker> getWorkerByClockNo(String clockNo) {
        return workerRepository.findByClockNo(clockNo);
    }
    
    // Get workers by status
    public List<Worker> getWorkersByStatus(WorkerStatus status) {
        return workerRepository.findByStatus(status);
    }
    
    // Get workers by type
    public List<Worker> getWorkersByType(WorkerType type) {
        return workerRepository.findByWorkerType(type);
    }
    
    // Get workers by department
    public List<Worker> getWorkersByDepartment(String department) {
        return workerRepository.findByDepartment(department);
    }
    
    // Search workers
    public List<Worker> searchWorkers(String search) {
        return workerRepository.searchWorkers(search);
    }
    
    // Create worker
    public Worker createWorker(Worker worker) {
        return workerRepository.save(worker);
    }
    
    // Update worker
    public Worker updateWorker(Long id, Worker workerDetails) {
        Worker worker = workerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        worker.setEmployeeCode(workerDetails.getEmployeeCode());
        worker.setClockNo(workerDetails.getClockNo());
        worker.setFirstName(workerDetails.getFirstName());
        worker.setLastName(workerDetails.getLastName());
        worker.setIdNumber(workerDetails.getIdNumber());
        worker.setWorkerType(workerDetails.getWorkerType());
        worker.setDepartment(workerDetails.getDepartment());
        worker.setRole(workerDetails.getRole());
        worker.setStatus(workerDetails.getStatus());
        worker.setSkills(workerDetails.getSkills());
        worker.setCertifications(workerDetails.getCertifications());
        worker.setHireDate(workerDetails.getHireDate());
        worker.setTerminationDate(workerDetails.getTerminationDate());
        worker.setPhone(workerDetails.getPhone());
        worker.setEmail(workerDetails.getEmail());
        worker.setCurrentHourlyRate(workerDetails.getCurrentHourlyRate());
        
        return workerRepository.save(worker);
    }
    
    // Delete worker
    public void deleteWorker(Long id) {
        Worker worker = workerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        workerRepository.delete(worker);
    }
    
    // Get worker statistics
    public WorkerStatistics getStatistics() {
        WorkerStatistics stats = new WorkerStatistics();
        stats.setTotalWorkers(workerRepository.count());
        stats.setActiveWorkers(workerRepository.countByStatus(WorkerStatus.ACTIVE));
        stats.setPermanentWorkers(workerRepository.countByWorkerType(WorkerType.PERMANENT));
        stats.setCasualWorkers(workerRepository.countByWorkerType(WorkerType.CASUAL));
        return stats;
    }
    
    // Inner class for statistics
    public static class WorkerStatistics {
        private long totalWorkers;
        private long activeWorkers;
        private long permanentWorkers;
        private long casualWorkers;
        
        // Getters and Setters
        public long getTotalWorkers() { return totalWorkers; }
        public void setTotalWorkers(long totalWorkers) { this.totalWorkers = totalWorkers; }
        
        public long getActiveWorkers() { return activeWorkers; }
        public void setActiveWorkers(long activeWorkers) { this.activeWorkers = activeWorkers; }
        
        public long getPermanentWorkers() { return permanentWorkers; }
        public void setPermanentWorkers(long permanentWorkers) { this.permanentWorkers = permanentWorkers; }
        
        public long getCasualWorkers() { return casualWorkers; }
        public void setCasualWorkers(long casualWorkers) { this.casualWorkers = casualWorkers; }
    }
}