package com.erha.ops.security;

import java.util.*;

/**
 * Maps UserRoles to their granted Permissions
 * This is the single source of truth for "who can do what" in ERHA OPS
 */
public class RolePermissionConfig {

    private static final Map<UserRole, Set<Permission>> ROLE_PERMISSIONS = new HashMap<>();

    static {
        // ==================== SYSTEM_ADMIN ====================
        // Technical administrator - full system access
        ROLE_PERMISSIONS.put(UserRole.SYSTEM_ADMIN, Set.of(
            // All permissions - system admin can do everything
            Permission.values()
        ));

        // ==================== ADMIN ====================
        // Business administrator - full business operations access
        ROLE_PERMISSIONS.put(UserRole.ADMIN, new HashSet<>(Arrays.asList(
            // RFQ
            Permission.VIEW_ALL_RFQS,
            Permission.CREATE_RFQ,
            Permission.EDIT_ALL_RFQS,
            Permission.DELETE_RFQ,
            
            // Quote
            Permission.VIEW_ALL_QUOTES,
            Permission.CREATE_QUOTE,
            Permission.EDIT_ALL_QUOTES,
            Permission.DELETE_QUOTE,
            Permission.APPROVE_QUOTE,
            Permission.REVISE_QUOTE,
            Permission.SEND_QUOTE_DOCUSIGN,
            Permission.VIEW_QUOTE_FINANCIALS,
            Permission.EDIT_APPROVED_QUOTE,
            
            // Job
            Permission.VIEW_ALL_JOBS,
            Permission.CREATE_JOB,
            Permission.EDIT_JOB,
            Permission.DELETE_JOB,
            Permission.UPDATE_JOB_PROGRESS,
            Permission.CREATE_EMERGENCY_JOB,
            Permission.CLOSE_JOB,
            Permission.REOPEN_CLOSED_JOB,
            
            // Client
            Permission.VIEW_CLIENTS,
            Permission.CREATE_CLIENT,
            Permission.EDIT_CLIENT,
            Permission.DELETE_CLIENT,
            Permission.VIEW_CLIENT_FINANCIALS,
            
            // User Management
            Permission.VIEW_USERS,
            Permission.CREATE_USER,
            Permission.EDIT_USER,
            Permission.DELETE_USER,
            Permission.ASSIGN_ROLES,
            Permission.RESET_USER_PASSWORD,
            Permission.MANAGE_USER_PINS,
            
            // Financial
            Permission.VIEW_FINANCIAL_REPORTS,
            Permission.VIEW_PROFIT_MARGINS,
            Permission.VIEW_COST_BREAKDOWN,
            Permission.EXPORT_FINANCIAL_DATA,
            
            // System
            Permission.VIEW_AUDIT_LOGS,
            Permission.VIEW_SYSTEM_HEALTH,
            
            // Reporting
            Permission.VIEW_REPORTS,
            Permission.CREATE_CUSTOM_REPORTS,
            Permission.EXPORT_REPORTS,
            Permission.SCHEDULE_REPORTS,
            
            // Workflow
            Permission.OVERRIDE_WORKFLOW,
            
            // Documents
            Permission.UPLOAD_DOCUMENTS,
            Permission.DELETE_DOCUMENTS,
            Permission.VIEW_ALL_DOCUMENTS
        )));

        // ==================== EXECUTIVE ====================
        // Read-only oversight - dashboard and reporting only
        ROLE_PERMISSIONS.put(UserRole.EXECUTIVE, new HashSet<>(Arrays.asList(
            // RFQ (read-only)
            Permission.VIEW_ALL_RFQS,
            
            // Quote (read-only)
            Permission.VIEW_ALL_QUOTES,
            Permission.VIEW_QUOTE_FINANCIALS,
            
            // Job (read-only)
            Permission.VIEW_ALL_JOBS,
            
            // Client (read-only)
            Permission.VIEW_CLIENTS,
            Permission.VIEW_CLIENT_FINANCIALS,
            
            // Financial (read-only)
            Permission.VIEW_FINANCIAL_REPORTS,
            Permission.VIEW_PROFIT_MARGINS,
            Permission.VIEW_COST_BREAKDOWN,
            Permission.EXPORT_FINANCIAL_DATA,
            
            // Reporting
            Permission.VIEW_REPORTS,
            Permission.EXPORT_REPORTS,
            
            // System
            Permission.VIEW_SYSTEM_HEALTH,
            
            // Documents (read-only)
            Permission.VIEW_ALL_DOCUMENTS
        )));

        // ==================== MANAGER ====================
        // Operations manager - approves quotes, oversees workflow
        ROLE_PERMISSIONS.put(UserRole.MANAGER, new HashSet<>(Arrays.asList(
            // RFQ
            Permission.VIEW_ALL_RFQS,
            Permission.CREATE_RFQ,
            Permission.EDIT_ALL_RFQS,
            Permission.DELETE_RFQ,
            
            // Quote
            Permission.VIEW_ALL_QUOTES,
            Permission.CREATE_QUOTE,
            Permission.EDIT_ALL_QUOTES,
            Permission.APPROVE_QUOTE,  // Requires PIN
            Permission.REVISE_QUOTE,
            Permission.SEND_QUOTE_DOCUSIGN,
            Permission.VIEW_QUOTE_FINANCIALS,
            
            // Job
            Permission.VIEW_ALL_JOBS,
            Permission.CREATE_JOB,
            Permission.EDIT_JOB,
            Permission.UPDATE_JOB_PROGRESS,
            Permission.CREATE_EMERGENCY_JOB,
            Permission.CLOSE_JOB,
            
            // Client
            Permission.VIEW_CLIENTS,
            Permission.CREATE_CLIENT,
            Permission.EDIT_CLIENT,
            Permission.VIEW_CLIENT_FINANCIALS,
            
            // Financial
            Permission.VIEW_FINANCIAL_REPORTS,
            Permission.VIEW_PROFIT_MARGINS,
            Permission.VIEW_COST_BREAKDOWN,
            
            // Reporting
            Permission.VIEW_REPORTS,
            Permission.EXPORT_REPORTS,
            
            // Documents
            Permission.UPLOAD_DOCUMENTS,
            Permission.VIEW_ALL_DOCUMENTS
        )));

        // ==================== ESTIMATOR ====================
        // Quote creator - creates and manages own quotes only
        ROLE_PERMISSIONS.put(UserRole.ESTIMATOR, new HashSet<>(Arrays.asList(
            // RFQ (limited to own)
            Permission.VIEW_OWN_RFQS,
            Permission.CREATE_RFQ,
            Permission.EDIT_OWN_RFQS,
            
            // Quote (limited to own, no approval)
            Permission.VIEW_OWN_QUOTES,
            Permission.CREATE_QUOTE,
            Permission.EDIT_OWN_QUOTES,
            Permission.REVISE_QUOTE,
            
            // Job (limited to jobs from own quotes)
            Permission.VIEW_OWN_JOBS,
            
            // Client (read-only)
            Permission.VIEW_CLIENTS,
            
            // Documents
            Permission.UPLOAD_DOCUMENTS,
            Permission.VIEW_ALL_DOCUMENTS
        )));

        // ==================== FINANCE ====================
        // Financial oversight - read-only financial visibility
        ROLE_PERMISSIONS.put(UserRole.FINANCE, new HashSet<>(Arrays.asList(
            // RFQ (read-only)
            Permission.VIEW_ALL_RFQS,
            
            // Quote (read-only with financial details)
            Permission.VIEW_ALL_QUOTES,
            Permission.VIEW_QUOTE_FINANCIALS,
            
            // Job (read-only)
            Permission.VIEW_ALL_JOBS,
            
            // Client
            Permission.VIEW_CLIENTS,
            Permission.VIEW_CLIENT_FINANCIALS,
            
            // Financial (full access)
            Permission.VIEW_FINANCIAL_REPORTS,
            Permission.VIEW_PROFIT_MARGINS,
            Permission.VIEW_COST_BREAKDOWN,
            Permission.EXPORT_FINANCIAL_DATA,
            
            // Reporting
            Permission.VIEW_REPORTS,
            Permission.CREATE_CUSTOM_REPORTS,
            Permission.EXPORT_REPORTS,
            
            // Documents (read-only)
            Permission.VIEW_ALL_DOCUMENTS
        )));

        // ==================== HUMAN_RESOURCES ====================
        // HR management - user accounts, employee data
        ROLE_PERMISSIONS.put(UserRole.HUMAN_RESOURCES, new HashSet<>(Arrays.asList(
            // User Management
            Permission.VIEW_USERS,
            Permission.CREATE_USER,
            Permission.EDIT_USER,
            Permission.DELETE_USER,
            Permission.ASSIGN_ROLES,
            Permission.RESET_USER_PASSWORD,
            Permission.MANAGE_USER_PINS,
            
            // HR specific
            Permission.VIEW_EMPLOYEE_DATA,
            Permission.MANAGE_EMPLOYEES,
            Permission.VIEW_TIMESHEETS,
            Permission.APPROVE_TIMESHEETS,
            
            // Reporting
            Permission.VIEW_REPORTS,
            Permission.EXPORT_REPORTS
        )));
    }

    /**
     * Get all permissions for a specific role
     */
    public static Set<Permission> getPermissionsForRole(UserRole role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Collections.emptySet());
    }

    /**
     * Get all permissions for a user with multiple roles
     * Combines permissions from all roles (union)
     */
    public static Set<Permission> getPermissionsForRoles(Set<UserRole> roles) {
        Set<Permission> combinedPermissions = new HashSet<>();
        for (UserRole role : roles) {
            combinedPermissions.addAll(getPermissionsForRole(role));
        }
        return combinedPermissions;
    }

    /**
     * Check if a specific role has a permission
     */
    public static boolean roleHasPermission(UserRole role, Permission permission) {
        return getPermissionsForRole(role).contains(permission);
    }

    /**
     * Check if any of the user's roles grants a permission
     */
    public static boolean rolesHavePermission(Set<UserRole> roles, Permission permission) {
        return getPermissionsForRoles(roles).contains(permission);
    }

    /**
     * Get all roles that have a specific permission
     */
    public static Set<UserRole> getRolesWithPermission(Permission permission) {
        Set<UserRole> rolesWithPermission = new HashSet<>();
        for (Map.Entry<UserRole, Set<Permission>> entry : ROLE_PERMISSIONS.entrySet()) {
            if (entry.getValue().contains(permission)) {
                rolesWithPermission.add(entry.getKey());
            }
        }
        return rolesWithPermission;
    }
}
