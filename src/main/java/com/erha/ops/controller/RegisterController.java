package com.erha.ops.controller;

import com.erha.ops.entity.User;
import com.erha.ops.repository.UserRepository;
import com.erha.ops.security.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        User user = new User();
        user.setUsername(request.get("username"));
        user.setEmail(request.get("email"));
        user.setPasswordHash(passwordEncoder.encode(request.get("password")));
        user.setFirstName(request.get("firstName"));
        user.setLastName(request.get("lastName"));
        user.setStatus(User.UserStatus.ACTIVE);
        user.addRole(UserRole.SYSTEM_ADMIN);
        
        userRepository.save(user);
        
        return ResponseEntity.ok("User created: " + user.getUsername());
    }
}
