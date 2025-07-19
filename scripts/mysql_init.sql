-- ERHA OPS v7.0 - Database Initialization Script
-- MySQL Database: erha_ops_v7
-- Enhanced Quote Management with Quality & Safety Integration

-- Use the database
USE erha_ops_v7;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create users table (if not exists from other modules)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('SYSTEM_ADMIN', 'EXECUTIVE', 'SAFETY_OFFICER', 'MODULE_ADMIN', 'MODULE_USER', 'WORKER', 'CLIENT_USER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION') DEFAULT 'ACTIVE',
    safety_clearance ENUM('BASIC', 'STANDARD', 'ADVANCED', 'FULL_ACCESS') DEFAULT 'BASIC',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(36) PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    rfq_id VARCHAR(36),
    client_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36),
    
    -- Basic Quote Information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('DRAFT', 'PENDING_REVIEW', 'PENDING_QUALITY_REVIEW', 'PENDING_SAFETY_REVIEW', 
                'PENDING_APPROVAL', 'APPROVED', 'SENT', 'SENT_TO_CLIENT', 'VIEWED', 
                'UNDER_NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 
                'CONVERTED_TO_CONTRACT', 'CANCELLED') DEFAULT 'DRAFT',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL') DEFAULT 'MEDIUM',
    
    -- Financial Information
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    
    -- Enhanced Quality & Safety Fields
    quality_cost DECIMAL(15,2) DEFAULT 0.00,
    safety_cost DECIMAL(15,2) DEFAULT 0.00,
    compliance_cost DECIMAL(15,2) DEFAULT 0.00,
    quality_requirements JSON,
    safety_assessment JSON,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    quality_level ENUM('STANDARD', 'ENHANCED', 'PREMIUM') DEFAULT 'STANDARD',
    
    -- Timeline
    valid_until DATETIME,
    delivery_days INT,
    estimated_start DATETIME,
    estimated_completion DATETIME,
    
    -- Approval Workflow
    approved_by VARCHAR(36),
    approved_at DATETIME,
    approval_notes TEXT,
    quality_reviewed_by VARCHAR(36),
    quality_reviewed_at DATETIME,
    quality_notes TEXT,
    
    -- Client Communication
    sent_at DATETIME,
    viewed_at DATETIME,
    client_feedback TEXT,
    revision_history JSON,
    
    -- Terms & Conditions
    terms_conditions TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    
    -- Metadata
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    -- Indexes
    INDEX idx_quote_status (status),
    INDEX idx_quote_client (client_id),
    INDEX idx_quote_number (quote_number),
    INDEX idx_quote_risk_score (risk_score),
    INDEX idx_quote_created_at (created_at)
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
    id VARCHAR(36) PRIMARY KEY,
    quote_id VARCHAR(36) NOT NULL,
    item_code VARCHAR(50),
    description TEXT NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    
    -- Quality & Safety Item Fields
    quality_cost_per_unit DECIMAL(15,2) DEFAULT 0.00,
    safety_cost_per_unit DECIMAL(15,2) DEFAULT 0.00,
    quality_specs JSON,
    safety_requirements JSON,
    risk_category ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
    
    -- Material & Labor Breakdown
    material_cost DECIMAL(15,2) DEFAULT 0.00,
    labor_cost DECIMAL(15,2) DEFAULT 0.00,
    overhead_cost DECIMAL(15,2) DEFAULT 0.00,
    margin_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timeline
    lead_time_days INT,
    notes TEXT,
    
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote_item_quote_id (quote_id, sort_order)
);

-- Create quote_approvals table
CREATE TABLE IF NOT EXISTS quote_approvals (
    id VARCHAR(36) PRIMARY KEY,
    quote_id VARCHAR(36) NOT NULL,
    approver_id VARCHAR(36) NOT NULL,
    approval_type ENUM('TECHNICAL', 'QUALITY', 'SAFETY', 'FINANCIAL', 'MANAGEMENT') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES') DEFAULT 'PENDING',
    comments TEXT,
    checklist_items JSON,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_approval (quote_id, approver_id, approval_type),
    INDEX idx_quote_approval_quote_status (quote_id, status)
);

-- Create quote_revisions table
CREATE TABLE IF NOT EXISTS quote_revisions (
    id VARCHAR(36) PRIMARY KEY,
    quote_id VARCHAR(36) NOT NULL,
    revised_by VARCHAR(36) NOT NULL,
    revision_number INT NOT NULL,
    revision_reason TEXT,
    changes_made JSON,
    previous_data JSON,
    new_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote_revision_quote_number (quote_id, revision_number)
);

-- Insert sample admin user if not exists
INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role, status, safety_clearance) 
VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@erha.co.za', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdOIGGZkJQyirDzC', 'System', 'Administrator', 'SYSTEM_ADMIN', 'ACTIVE', 'FULL_ACCESS'),
('550e8400-e29b-41d4-a716-446655440001', 'quote_manager', 'quotes@erha.co.za', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdOIGGZkJQyirDzC', 'Quote', 'Manager', 'MODULE_ADMIN', 'ACTIVE', 'ADVANCED');

-- Insert sample quote data
INSERT IGNORE INTO quotes (id, quote_number, client_id, created_by, title, description, status, priority, total_amount, currency, quality_cost, safety_cost, compliance_cost, risk_score, quality_level, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'QUO-2025-00001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Steel Fabrication - Mining Equipment', 'Custom steel fabrication project for mining equipment with enhanced safety requirements', 'DRAFT', 'MEDIUM', 150000.00, 'ZAR', 7500.00, 3000.00, 1500.00, 25, 'ENHANCED', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'QUO-2025-00002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Structural Steel - Office Building', 'Structural steel work for new office building construction', 'PENDING_APPROVAL', 'HIGH', 250000.00, 'ZAR', 12500.00, 5000.00, 2500.00, 35, 'PREMIUM', NOW(), NOW());

COMMIT;

SELECT 'ERHA OPS v7.0 Database Initialization Complete!' as status;
