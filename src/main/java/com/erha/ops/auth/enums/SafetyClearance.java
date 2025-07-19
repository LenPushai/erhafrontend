package com.erha.ops.auth.enums;

public enum SafetyClearance {
    BASIC(1, "Basic"),
    WORKSHOP(2, "Workshop"),
    EQUIPMENT(3, "Equipment"),
    SUPERVISOR(4, "Supervisor"),
    MANAGER(5, "Manager"),
    OFFICER(6, "Officer"),
    ADMIN(7, "Admin");
    
    private final int level;
    private final String displayName;
    
    SafetyClearance(int level, String displayName) {
        this.level = level;
        this.displayName = displayName;
    }
    
    public int getLevel() {
        return level;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return displayName + " level clearance";
    }
    
    public boolean hasAccess(SafetyClearance requiredClearance) {
        return this.level >= requiredClearance.level;
    }
}