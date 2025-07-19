package com.erha.ops.auth.enums;

public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended"),
    LOCKED("Locked"),
    PENDING_ACTIVATION("Pending Activation"),
    EXPIRED("Expired");
    
    private final String displayName;
    
    UserStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isAccessible() {
        return this == ACTIVE;
    }
}