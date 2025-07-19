package com.erha.ops.auth.service;

import com.erha.ops.auth.dto.AuthRequest;
import com.erha.ops.auth.dto.AuthResponse;
import com.erha.ops.auth.dto.RegisterRequest;
import com.erha.ops.entity.User;
import com.erha.ops.repository.UserRepository;
import com.erha.ops.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(AuthRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Get user from database - handle missing user gracefully
            Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
            if (userOptional.isEmpty()) {
                // Return null instead of throwing exception
                return null;
            }
            
            User user = userOptional.get();

            // Generate JWT token - pass the authentication object, not string
            String token = jwtTokenProvider.generateToken(authentication);

            // Create response - using setters since constructor has issues
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());

            return response;

        } catch (BadCredentialsException e) {
            // Return null instead of throwing exception
            return null;
        } catch (Exception e) {
            // Return null instead of throwing exception  
            return null;
        }
    }

    // Add the missing register method
    public AuthResponse register(RegisterRequest request) {
        // Registration disabled for now - return null
        return null;
    }
}