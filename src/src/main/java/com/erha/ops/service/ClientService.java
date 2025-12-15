package com.erha.ops.service;

import com.erha.ops.entity.Client;
import com.erha.ops.entity.Client.ClientStatus;
import com.erha.ops.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientService {
    
    @Autowired
    private ClientRepository clientRepository;
    
    // Get all clients
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }
    
    // Get client by ID
    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }
    
    // Get client by code
    public Optional<Client> getClientByCode(String clientCode) {
        return clientRepository.findByClientCode(clientCode);
    }
    
    // Get client by company name
    public Optional<Client> getClientByCompanyName(String companyName) {
        return clientRepository.findByCompanyName(companyName);
    }
    
    // Get clients by status
    public List<Client> getClientsByStatus(ClientStatus status) {
        return clientRepository.findByStatus(status);
    }
    
    // Get active clients
    public List<Client> getActiveClients() {
        return clientRepository.findAllActiveClients();
    }
    
    // Get clients by city
    public List<Client> getClientsByCity(String city) {
        return clientRepository.findByCity(city);
    }
    
    // Get clients by province
    public List<Client> getClientsByProvince(String province) {
        return clientRepository.findByProvince(province);
    }
    
    // Get clients by industry
    public List<Client> getClientsByIndustry(String industry) {
        return clientRepository.findByIndustry(industry);
    }
    
    // Search clients
    public List<Client> searchClients(String search) {
        return clientRepository.searchClients(search);
    }
    
    // Create client
    public Client createClient(Client client) {
        // Auto-generate client code if not provided
        if (client.getClientCode() == null || client.getClientCode().isEmpty()) {
            client.setClientCode(generateClientCode());
        }
        return clientRepository.save(client);
    }
    
    // Update client
    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        client.setClientCode(clientDetails.getClientCode());
        client.setCompanyName(clientDetails.getCompanyName());
        client.setContactPerson(clientDetails.getContactPerson());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setMobile(clientDetails.getMobile());
        client.setPhysicalAddress(clientDetails.getPhysicalAddress());
        client.setPostalAddress(clientDetails.getPostalAddress());
        client.setCity(clientDetails.getCity());
        client.setProvince(clientDetails.getProvince());
        client.setPostalCode(clientDetails.getPostalCode());
        client.setCountry(clientDetails.getCountry());
        client.setVatNumber(clientDetails.getVatNumber());
        client.setRegistrationNumber(clientDetails.getRegistrationNumber());
        client.setPaymentTerms(clientDetails.getPaymentTerms());
        client.setCreditLimit(clientDetails.getCreditLimit());
        client.setStatus(clientDetails.getStatus());
        client.setIndustry(clientDetails.getIndustry());
        client.setNotes(clientDetails.getNotes());
        
        return clientRepository.save(client);
    }
    
    // Delete client
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        clientRepository.delete(client);
    }
    
    // Get client statistics
    public ClientStatistics getStatistics() {
        ClientStatistics stats = new ClientStatistics();
        stats.setTotalClients(clientRepository.count());
        stats.setActiveClients(clientRepository.countByStatus(ClientStatus.ACTIVE));
        stats.setInactiveClients(clientRepository.countByStatus(ClientStatus.INACTIVE));
        stats.setSuspendedClients(clientRepository.countByStatus(ClientStatus.SUSPENDED));
        return stats;
    }
    
    // Generate client code
    private String generateClientCode() {
        long count = clientRepository.count();
        return String.format("CLI-%05d", count + 1);
    }
    
    // Inner class for statistics
    public static class ClientStatistics {
        private long totalClients;
        private long activeClients;
        private long inactiveClients;
        private long suspendedClients;
        
        // Getters and Setters
        public long getTotalClients() { return totalClients; }
        public void setTotalClients(long totalClients) { this.totalClients = totalClients; }
        
        public long getActiveClients() { return activeClients; }
        public void setActiveClients(long activeClients) { this.activeClients = activeClients; }
        
        public long getInactiveClients() { return inactiveClients; }
        public void setInactiveClients(long inactiveClients) { this.inactiveClients = inactiveClients; }
        
        public long getSuspendedClients() { return suspendedClients; }
        public void setSuspendedClients(long suspendedClients) { this.suspendedClients = suspendedClients; }
    }
}