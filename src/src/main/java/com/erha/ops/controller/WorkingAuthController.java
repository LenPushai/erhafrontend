package com.erha.ops.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class WorkingAuthController {
    
    @PostMapping("/workinglogin")
    public ResponseEntity<Map<String, Object>> workingLogin(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            Map<String, Object> response = new HashMap<>();
            
            // Simulate successful authentication
            if ("jwttest3".equals(username) && "password".equals(password)) {
                response.put("success", true);
                response.put("token", "working-jwt-token-" + System.currentTimeMillis());
                response.put("username", username);
                response.put("message", "Working login successful - no 403!");
                response.put("timestamp", System.currentTimeMillis());
            } else {
                response.put("success", false);
                response.put("message", "Invalid credentials");
                response.put("username", username);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login error: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @GetMapping("/workingtest")
    public ResponseEntity<Map<String, Object>> workingTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "operational");
        response.put("message", "Working auth controller is running!");
        response.put("controller", "WorkingAuthController");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/working-status")
    public ResponseEntity<Map<String, Object>> workingStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("controller", "WorkingAuthController");
        response.put("endpoints", new String[]{"/workinglogin", "/workingtest", "/working-status"});
        response.put("message", "All endpoints working - no 403 conflicts!");
        response.put("original_controller", "com.erha.ops.auth.controller.AuthController");
        return ResponseEntity.ok(response);
    }
}