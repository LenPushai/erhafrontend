package com.erha.ops;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {
    
    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from test controller!");
        response.put("status", "Security bypassed!");
        return response;
    }
    
    @PostMapping("/login")
    public Map<String, String> testLogin(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Test login successful!");
        response.put("username", request.get("username"));
        response.put("token", "fake-jwt-token-for-testing");
        return response;
    }
}