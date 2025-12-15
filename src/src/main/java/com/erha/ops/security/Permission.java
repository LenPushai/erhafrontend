package com.erha.ops.security;

/**
 * Granular permissions for ERHA Operations Management System
 * These permissions are mapped to roles via RolePermissionConfig
 */
public enum Permission {
    
    // ==================== RFQ PERMISSIONS ====================
    VIEW_OWN_RFQS,           // View RFQs created by this user
    VIEW_ALL_RFQS,           // View all RFQs in system
    CREATE_RFQ,              // Create new RFQ
    EDIT_OWN_RFQS,           // Edit RFQs created by this user
    EDIT_ALL_RFQS,           // Edit any RFQ
    DELETE_RFQ,              // Soft delete RFQs
    
    // ==================== QUOTE PERMISSIONS ====================
    VIEW_OWN_QUOTES,         // View quotes created by this user
    VIEW_ALL_QUOTES,         // View all quotes in system
    CREATE_QUOTE,            // Generate quote from RFQ
    EDIT_OWN_QUOTES,         // Edit quotes created by this user (before approval)
    EDIT_ALL_QUOTES,         // Edit any quote
    DELETE_QUOTE,            // Soft delete quotes
    APPROVE_QUOTE,           // Approve quote with PIN
    REVISE_QUOTE,            // Create quote revision
    SEND_QUOTE_DOCUSIGN,     // Send quote via DocuSign
    VIEW_QUOTE_FINANCIALS,   // View pricing, margins, costs
    
    // ==================== JOB PERMISSIONS ====================
    VIEW_OWN_JOBS,           // View jobs created from own quotes
    VIEW_ALL_JOBS,           // View all jobs in system
    CREATE_JOB,              // Convert quote to job
    EDIT_JOB,                // Edit job details
    DELETE_JOB,              // Soft delete jobs
    UPDATE_JOB_PROGRESS,     // Update work progress tracking
    CREATE_EMERGENCY_JOB,    // Create emergency job (bypass RFQ/Quote)
    CLOSE_JOB,               // Mark job as completed
    
    // ==================== CLIENT PERMISSIONS ====================
    VIEW_CLIENTS,            // View client records
    CREATE_CLIENT,           // Add new client
    EDIT_CLIENT,             // Edit client details
    DELETE_CLIENT,           // Soft delete client
    VIEW_CLIENT_FINANCIALS,  // View client payment history, credit status
    
    // ==================== USER MANAGEMENT PERMISSIONS ====================
    VIEW_USERS,              // View user list
    CREATE_USER,             // Add new user account
    EDIT_USER,               // Edit user details
    DELETE_USER,             // Deactivate user account
    ASSIGN_ROLES,            // Assign/remove roles from users
    RESET_USER_PASSWORD,     // Reset user passwords
    MANAGE_USER_PINS,        // Set/reset approval PINs
    
    // ==================== FINANCIAL PERMISSIONS ====================
    VIEW_FINANCIAL_REPORTS,  // Access financial dashboards
    VIEW_PROFIT_MARGINS,     // View quote/job profitability
    VIEW_COST_BREAKDOWN,     // View detailed cost analysis
    EXPORT_FINANCIAL_DATA,   // Export financial reports
    
    // ==================== SYSTEM ADMINISTRATION ====================
    VIEW_AUDIT_LOGS,         // View system audit trail
    MANAGE_SYSTEM_SETTINGS,  // Configure system parameters
    BACKUP_DATABASE,         // Trigger database backups
    MANAGE_INTEGRATIONS,     // Configure DocuSign, email, etc.
    VIEW_SYSTEM_HEALTH,      // Monitor system performance
    
    // ==================== REPORTING PERMISSIONS ====================
    VIEW_REPORTS,            // Access standard reports
    CREATE_CUSTOM_REPORTS,   // Build custom reports
    EXPORT_REPORTS,          // Export reports to Excel/PDF
    SCHEDULE_REPORTS,        // Set up automated report delivery
    
    // ==================== WORKFLOW PERMISSIONS ====================
    OVERRIDE_WORKFLOW,       // Bypass standard workflow rules
    EDIT_APPROVED_QUOTE,     // Modify quote after approval (rare, audited)
    REOPEN_CLOSED_JOB,       // Reactivate completed job
    
    // ==================== DOCUMENT PERMISSIONS ====================
    UPLOAD_DOCUMENTS,        // Attach files to RFQ/Quote/Job
    DELETE_DOCUMENTS,        // Remove uploaded files
    VIEW_ALL_DOCUMENTS,      // Access all system documents
    
    // ==================== HR PERMISSIONS ====================
    VIEW_EMPLOYEE_DATA,      // Access employee information
    MANAGE_EMPLOYEES,        // Add/edit employee records
    VIEW_TIMESHEETS,         // Access worker time tracking
    APPROVE_TIMESHEETS       // Approve submitted timesheets
}
