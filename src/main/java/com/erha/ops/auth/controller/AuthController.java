package com.erha.ops.auth.controller;

import com.erha.ops.auth.dto.AuthRequest;
import com.erha.ops.auth.dto.AuthResponse;
import com.erha.ops.auth.dto.RegisterRequest;
import com.erha.ops.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            if (authResponse == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid credentials");
                return ResponseEntity.status(401).body(errorResponse);
            }
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration is currently disabled");
        return ResponseEntity.status(501).body(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("ERHA OPS Authentication API is RUNNING! System Status: OPERATIONAL");
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debug() {
        Map<String, Object> response = new HashMap<>();
        response.put("controller", "AuthController");
        response.put("status", "operational");
        response.put("endpoints", new String[]{"/login", "/register", "/test", "/debug"});
        response.put("message", "Original AuthController debug endpoint");
        return ResponseEntity.ok(response);
    }
}