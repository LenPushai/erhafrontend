package com.erha.ops.auth.enums;

public enum UserRole {
    SYSTEM_ADMIN("System Administrator"),
    EXECUTIVE("Executive"),
    SAFETY_OFFICER("Safety Officer"),
    MODULE_ADMIN("Module Administrator"),
    MODULE_USER("Module User"),
    WORKER("Worker"),
    CLIENT_USER("Client User");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isAdminRole() {
        return this == SYSTEM_ADMIN || this == MODULE_ADMIN;
    }
    
    public boolean isSafetyRole() {
        return this == SAFETY_OFFICER;
    }
    
    public boolean isExecutiveRole() {
        return this == EXECUTIVE || this == SYSTEM_ADMIN;
    }
}