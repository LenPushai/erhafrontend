package com.erha.ops.controller;

import com.erha.ops.service.DocuSignService;
import com.erha.ops.service.DocuSignWebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/docusign")
@PreAuthorize("isAuthenticated()")
public class DocuSignController {

    @Autowired
    private DocuSignService docuSignService;

    @Autowired
    private DocuSignWebhookService webhookService;

    /**
     * Send quote for signature via DocuSign
     * 
     * POST /api/v1/docusign/send-quote
     * Body: {
     *   "quoteId": 12,
     *   "managerEmail": "manager@erha.co.za",
     *   "managerName": "John Manager",
     *   "clientEmail": "client@company.co.za",
     *   "clientName": "Jane Client"
     * }
     */
    @PostMapping("/send-quote")
    @PreAuthorize("hasAuthority('SEND_QUOTE_DOCUSIGN')")
    public ResponseEntity<?> sendQuoteForSignature(@RequestBody Map<String, Object> request) {
        try {
            Long quoteId = Long.parseLong(request.get("quoteId").toString());
            String managerEmail = request.get("managerEmail").toString();
            String managerName = request.get("managerName").toString();
            String clientEmail = request.get("clientEmail").toString();
            String clientName = request.get("clientName").toString();
            
            String envelopeId = docuSignService.sendQuoteForSignature(
                quoteId,
                managerEmail,
                managerName,
                clientEmail,
                clientName
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "envelopeId", envelopeId,
                "message", "Quote sent for signature successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * DocuSign webhook endpoint
     * DocuSign will call this when envelope status changes
     * 
     * POST /api/v1/docusign/webhook
     */
    @PostMapping("/webhook")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            String envelopeId = payload.get("envelopeId").toString();
            String status = payload.get("status").toString();
            String recipientId = payload.getOrDefault("recipientId", "").toString();
            
            webhookService.handleWebhook(envelopeId, status, recipientId);
            
            return ResponseEntity.ok(Map.of("received", true));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get envelope status
     * 
     * GET /api/v1/docusign/status/{envelopeId}
     */
    @GetMapping("/status/{envelopeId}")
    @PreAuthorize("hasAnyAuthority('VIEW_ALL_QUOTES', 'VIEW_OWN_QUOTES')")
    public ResponseEntity<?> getEnvelopeStatus(@PathVariable String envelopeId) {
        try {
            String status = docuSignService.getEnvelopeStatus(envelopeId);
            
            return ResponseEntity.ok(Map.of(
                "envelopeId", envelopeId,
                "status", status
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}
