package com.erha.ops.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class TestAuthController {
    
    @PostMapping("/testlogin")
    public ResponseEntity<Map<String, Object>> testLogin(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test login successful");
        response.put("username", request.get("username"));
        response.put("token", "test-jwt-token-" + System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/testping")
    public ResponseEntity<String> testPing() {
        return ResponseEntity.ok("Test controller is working!");
    }
}