package com.erha.ops.security;

/**
 * User roles for ERHA Operations Management System
 * Each role maps to a set of permissions via RolePermissionConfig
 */
public enum UserRole {
    
    /**
     * SYSTEM_ADMIN - Technical administrator
     * Full system access including database, integrations, backups
     */
    SYSTEM_ADMIN,
    
    /**
     * ADMIN - Business administrator
     * Can approve quotes, manage users, full business visibility
     * Requires approval PIN for quote approvals
     */
    ADMIN,
    
    /**
     * EXECUTIVE - Read-only oversight
     * Dashboard and reporting access, no editing capabilities
     */
    EXECUTIVE,
    
    /**
     * MANAGER - Operations manager
     * Approves quotes, oversees workflow, full operational visibility
     * Requires approval PIN for quote approvals
     * Can perform estimation work if needed (double-hatting scenario)
     */
    MANAGER,
    
    /**
     * ESTIMATOR - Quote creator
     * Creates and edits own quotes, limited to own work visibility
     */
    ESTIMATOR,
    
    /**
     * FINANCE - Financial oversight
     * Views financial data, profit margins, cost breakdowns
     * Read-only access to quotes/jobs for financial analysis
     */
    FINANCE,
    
    /**
     * HUMAN_RESOURCES - HR management
     * Manages employee data, timesheets, user accounts
     */
    HUMAN_RESOURCES
}
