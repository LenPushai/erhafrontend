package com.erha.ops.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "Admin@2025";
        String hash = encoder.encode(password);
        
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash:");
        System.out.println(hash);
        System.out.println("========================================");
    }
}
