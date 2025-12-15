package com.erha.ops.entity;

import com.erha.ops.security.UserRole;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * User Entity for ERHA OPS System
 * Enhanced with RBAC (Role-Based Access Control)
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_username", columnList = "username"),
    @Index(name = "idx_user_email", columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    /**
     * Multiple roles support - allows users to wear multiple hats
     * Example: General Manager can be both MANAGER and ESTIMATOR
     * Stored in separate user_roles junction table
     */
    @ElementCollection(targetClass = UserRole.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private Set<UserRole> roles = new HashSet<>();

    /**
     * Approval PIN for MANAGER and ADMIN roles
     * Used to authorize quote approvals
     * Must be 4-6 digits, stored as hashed value for security
     */
    @Column(name = "approval_pin_hash", length = 255)
    private String approvalPinHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Enums
    public enum UserStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        PENDING_ACTIVATION
    }

    // Constructors
    public User() {}

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getPassword() { 
        return passwordHash; 
    }
    
    public void setPassword(String password) { 
        this.passwordHash = password; 
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Set<UserRole> getRoles() { return roles; }
    public void setRoles(Set<UserRole> roles) { this.roles = roles; }

    public String getApprovalPinHash() { return approvalPinHash; }
    public void setApprovalPinHash(String approvalPinHash) { this.approvalPinHash = approvalPinHash; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    // Helper methods
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE && deletedAt == null;
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(UserRole requiredRole) {
        return this.roles.contains(requiredRole);
    }

    /**
     * Check if user has ANY of the specified roles
     */
    public boolean hasAnyRole(UserRole... requiredRoles) {
        for (UserRole role : requiredRoles) {
            if (this.roles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has ALL of the specified roles
     */
    public boolean hasAllRoles(UserRole... requiredRoles) {
        for (UserRole role : requiredRoles) {
            if (!this.roles.contains(role)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Add role to user
     */
    public void addRole(UserRole role) {
        this.roles.add(role);
    }

    /**
     * Remove role from user
     */
    public void removeRole(UserRole role) {
        this.roles.remove(role);
    }

    /**
     * Check if user requires approval PIN for their role(s)
     */
    public boolean requiresApprovalPin() {
        return hasAnyRole(UserRole.MANAGER, UserRole.ADMIN);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", roles=" + roles +
                ", status=" + status +
                '}';
    }
}
