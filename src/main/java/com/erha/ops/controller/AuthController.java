package com.erha.ops.controller;

import com.erha.ops.dto.AuthResponse;
import com.erha.ops.dto.LoginRequest;
import com.erha.ops.entity.User;
import com.erha.ops.repository.UserRepository;
import com.erha.ops.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller - Handles login and user registration
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
            String jwt = jwtUtil.generateToken(userDetails);

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse response = new AuthResponse(jwt, user.getUsername(), user.getRoles());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (jwtUtil.validateToken(token, userDetails)) {
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRoles()));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token validation failed");
        }
    }
}
