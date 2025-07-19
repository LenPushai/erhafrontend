package com.erha.ops.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class DiagnosticAuthController {
    
    @PostMapping("/diagnostic")
    public ResponseEntity<Map<String, Object>> diagnostic(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Simulate what the original controller might be doing
            String username = request.get("username");
            String password = request.get("password");
            
            response.put("step1", "Received request");
            response.put("username", username);
            
            // Simulate service call
            response.put("step2", "About to call auth service");
            
            // Simulate potential exception scenarios
            if ("exception_test".equals(username)) {
                throw new RuntimeException("Simulated auth exception");
            }
            
            if ("forbidden_test".equals(username)) {
                return ResponseEntity.status(403).body(Map.of("error", "Explicitly forbidden"));
            }
            
            response.put("step3", "Auth service call successful");
            response.put("result", "Diagnostic completed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Exception occurred: " + e.getMessage());
            errorResponse.put("exception_type", e.getClass().getSimpleName());
            errorResponse.put("step", "Exception during processing");
            
            // Return as 200 OK to see the error details
            return ResponseEntity.ok(errorResponse);
        }
    }
}