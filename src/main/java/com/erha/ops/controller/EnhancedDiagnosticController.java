package com.erha.ops.controller;

import com.erha.ops.entity.User;
import com.erha.ops.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class EnhancedDiagnosticController {

    @Autowired(required = false)
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @PostMapping("/enhanced-diagnostic")
    public ResponseEntity<Map<String, Object>> enhancedDiagnostic(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = request.get("username");
            String password = request.get("password");
            
            response.put("step1_received", "Request received successfully");
            response.put("username", username);
            response.put("password_length", password != null ? password.length() : 0);

            // Check if UserRepository is available
            if (userRepository == null) {
                response.put("step2_error", "UserRepository not available");
                return ResponseEntity.ok(response);
            }

            response.put("step2_repository", "UserRepository available");

            // Try to find user
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                response.put("step3_user_lookup", "User NOT found in database");
                response.put("recommendation", "Check if user jwttest3 exists in database");
                return ResponseEntity.ok(response);
            }

            User user = userOpt.get();
            response.put("step3_user_lookup", "User found in database");
            response.put("user_email", user.getEmail());
            response.put("user_id", user.getId());

            // Check password encoder
            if (passwordEncoder == null) {
                response.put("step4_error", "PasswordEncoder not available");
                return ResponseEntity.ok(response);
            }

            response.put("step4_encoder", "PasswordEncoder available");

            // Check password match
            String storedPassword = user.getPassword();
            response.put("stored_password_length", storedPassword != null ? storedPassword.length() : 0);
            response.put("stored_password_starts_with", storedPassword != null && storedPassword.length() > 7 ? storedPassword.substring(0, 7) : "N/A");

            if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
                response.put("step5_password", "Password matches!");
                response.put("authentication_should_work", true);
            } else {
                response.put("step5_password", "Password does NOT match");
                response.put("authentication_should_work", false);
                response.put("recommendation", "Check if password 'password' was correctly hashed as BCrypt");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Exception: " + e.getMessage());
            response.put("exception_type", e.getClass().getSimpleName());
            return ResponseEntity.ok(response);
        }
    }
}