package com.erha.ops.dto;

import com.erha.ops.security.UserRole;
import java.util.Set;

/**
 * Authentication Response DTO
 */
public class AuthResponse {
    private String token;
    private String username;
    private Set<UserRole> roles;

    public AuthResponse() {}

    public AuthResponse(String token, String username, Set<UserRole> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }
}
