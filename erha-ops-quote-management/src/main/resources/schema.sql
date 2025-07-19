-- 🚀💰 ERHA QUOTE MANAGEMENT - MYSQL SCHEMA 💰🚀
-- Professional quote creation, approval, and client communication

-- Ensure we're using the correct database
USE erha_ops_v7;

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    rfq_id BIGINT,
    client_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    
    -- Financial fields
    base_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    quality_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    safety_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    material_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    labor_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    markup_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Timeline fields
    valid_until DATETIME NOT NULL,
    estimated_duration_days INT NOT NULL,
    estimated_start_date DATETIME,
    estimated_completion_date DATETIME,
    
    -- Quality & Safety fields
    quality_requirements TEXT,
    safety_considerations TEXT,
    required_quality_level VARCHAR(50) DEFAULT 'STANDARD',
    iso9001_required BOOLEAN DEFAULT FALSE,
    risk_assessment VARCHAR(50) DEFAULT 'LOW',
    
    -- Team & Approval fields
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    approved_at DATETIME,
    reviewed_by VARCHAR(255),
    reviewed_at DATETIME,
    internal_notes TEXT,
    client_notes TEXT,
    
    -- Metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Indexes for performance
    INDEX idx_quote_number (quote_number),
    INDEX idx_rfq_id (rfq_id),
    INDEX idx_client_name (client_name),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_total_amount (total_amount)
);

-- Create quote_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit VARCHAR(10) NOT NULL DEFAULT 'EA',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Quality & Material specs
    material_specification VARCHAR(500),
    quality_standard VARCHAR(255),
    quality_inspection_required BOOLEAN DEFAULT FALSE,
    safety_equipment_required BOOLEAN DEFAULT FALSE,
    
    -- Timeline
    lead_time_days INT,
    notes TEXT,
    
    -- Metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key and indexes
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote_id (quote_id),
    INDEX idx_category (category),
    INDEX idx_item_name (item_name)
);

-- Create quote_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    description TEXT,
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key and indexes
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote_id (quote_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_at (uploaded_at)
);

-- Insert initial test data for demonstration
INSERT IGNORE INTO quotes (
    quote_number, rfq_id, client_name, project_title, description,
    status, priority, base_amount, quality_cost, safety_cost,
    material_cost, labor_cost, markup_percentage, total_amount,
    valid_until, estimated_duration_days, required_quality_level,
    iso9001_required, risk_assessment, created_by, contact_email,
    contact_phone
) VALUES (
    'QTE2025071900001', 1, 'ERHA Manufacturing Demo', 
    'Professional Pressure Vessel Quote', 
    'High-quality pressure vessel with ISO 9001 certification and comprehensive safety protocols',
    'DRAFT', 'HIGH', 75000.00, 7500.00, 5000.00,
    35000.00, 20000.00, 15.0, 163625.00,
    '2025-08-19 23:59:59', 45, 'ISO_9001',
    TRUE, 'MEDIUM', 'Dynamic Duo Engineer', 'client@erha.co.za',
    '+27123456789'
);

-- Add sample quote items
INSERT IGNORE INTO quote_items (
    quote_id, item_name, description, category, quantity, unit,
    unit_price, total_price, material_specification, quality_standard,
    quality_inspection_required, safety_equipment_required, lead_time_days
) VALUES 
(1, 'Pressure Vessel Shell', 'Main vessel shell fabrication', 'FABRICATION', 1, 'EA', 45000.00, 45000.00, 'ASTM A516 Grade 70', 'ASME Section VIII', TRUE, TRUE, 30),
(1, 'Safety Relief Valves', 'Pressure relief safety valves', 'SAFETY_EQUIPMENT', 2, 'EA', 2500.00, 5000.00, 'Stainless Steel 316', 'API 526', TRUE, TRUE, 14),
(1, 'Quality Inspection', 'Third-party quality inspection and certification', 'QUALITY_CONTROL', 1, 'SERVICE', 7500.00, 7500.00, 'N/A', 'ISO 9001', TRUE, FALSE, 7);

SELECT '🔥💰 MYSQL SCHEMA INITIALIZED SUCCESSFULLY! 💰🔥' AS message;
