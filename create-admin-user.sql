-- ERHA OPS - Create Admin User
-- Uses proper CHAR(36) UUID format

USE erha_ops_v7;

-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Create admin user with proper UUID format
INSERT INTO users (
    id, username, email, password, password_hash, first_name, last_name,
    employee_id, department, position, user_role, user_status, 
    safety_clearance, is_active, created_at, updated_at, created_by, updated_by,
    failed_login_attempts, two_factor_enabled
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- Fixed UUID format for CHAR(36)
    'admin', 
    'admin@erha-ops.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM..FbCW8EbvdUBOylL6',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM..FbCW8EbvdUBOylL6',
    'System', 'Administrator', 'EMP001', 'IT Department', 
    'System Administrator', 'SYSTEM_ADMIN', 'ACTIVE', 'ADMIN', 1,
    NOW(), NOW(), 'system', 'system', 0, 0
);

-- Verify admin user was created
SELECT id, username, email, user_role, is_active FROM users WHERE username = 'admin';