package com.erha.ops.repository;

import com.erha.ops.entity.Client;
import com.erha.ops.entity.Client.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    // Find by client code
    Optional<Client> findByClientCode(String clientCode);
    
    // Find by company name
    Optional<Client> findByCompanyName(String companyName);
    
    // Find by status
    List<Client> findByStatus(ClientStatus status);
    
    // Find by city
    List<Client> findByCity(String city);
    
    // Find by province
    List<Client> findByProvince(String province);
    
    // Find by industry
    List<Client> findByIndustry(String industry);
    
    // Search clients
    @Query("SELECT c FROM Client c WHERE " +
           "LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.clientCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Client> searchClients(@Param("search") String search);
    
    // Count by status
    long countByStatus(ClientStatus status);
    
    // Find active clients
    @Query("SELECT c FROM Client c WHERE c.status = 'ACTIVE' ORDER BY c.companyName")
    List<Client> findAllActiveClients();
}