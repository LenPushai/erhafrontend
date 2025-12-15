package com.erha.ops.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.erha.ops.entity.Client;
import com.erha.ops.entity.Client.ClientStatus;
import com.erha.ops.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/v1/clients")
@CrossOrigin(origins = "http://localhost:3028")
public class ClientController {
    
    @Autowired
    private ClientService clientService;
    
    // Get all clients
    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }
    
    // Get client by ID
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientService.getClientById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Get client by code
    @GetMapping("/code/{clientCode}")
    public ResponseEntity<Client> getClientByCode(@PathVariable String clientCode) {
        return clientService.getClientByCode(clientCode)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Get active clients
    @GetMapping("/active")
    public ResponseEntity<List<Client>> getActiveClients() {
        List<Client> clients = clientService.getActiveClients();
        return ResponseEntity.ok(clients);
    }
    
    // Get clients by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Client>> getClientsByStatus(@PathVariable String status) {
        try {
            ClientStatus clientStatus = ClientStatus.valueOf(status.toUpperCase());
            List<Client> clients = clientService.getClientsByStatus(clientStatus);
            return ResponseEntity.ok(clients);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get clients by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Client>> getClientsByCity(@PathVariable String city) {
        List<Client> clients = clientService.getClientsByCity(city);
        return ResponseEntity.ok(clients);
    }
    
    // Get clients by province
    @GetMapping("/province/{province}")
    public ResponseEntity<List<Client>> getClientsByProvince(@PathVariable String province) {
        List<Client> clients = clientService.getClientsByProvince(province);
        return ResponseEntity.ok(clients);
    }
    
    // Get clients by industry
    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<Client>> getClientsByIndustry(@PathVariable String industry) {
        List<Client> clients = clientService.getClientsByIndustry(industry);
        return ResponseEntity.ok(clients);
    }
    
    // Search clients
    @GetMapping("/search")
    public ResponseEntity<List<Client>> searchClients(@RequestParam String query) {
        List<Client> clients = clientService.searchClients(query);
        return ResponseEntity.ok(clients);
    }
    
    // Get client statistics
    @GetMapping("/statistics")
    public ResponseEntity<ClientService.ClientStatistics> getStatistics() {
        ClientService.ClientStatistics stats = clientService.getStatistics();
        return ResponseEntity.ok(stats);
    }
    
    // Create client
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        try {
            Client createdClient = clientService.createClient(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdClient);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update client
    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(id, client);
            return ResponseEntity.ok(updatedClient);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Delete client
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
