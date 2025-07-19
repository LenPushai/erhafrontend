-- Simple RFQ Table for initial testing
-- ERHA OPS v7.0 RFQ Module

DROP TABLE IF EXISTS simple_rfqs;

CREATE TABLE simple_rfqs (
    rfq_id CHAR(36) PRIMARY KEY,
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100),
    status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUALITY_ASSESSMENT', 'SAFETY_ASSESSMENT', 
               'PENDING_CLARIFICATION', 'READY_FOR_QUOTE', 'CONVERTED', 'DECLINED', 'EXPIRED', 
               'ON_HOLD', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    estimated_value DECIMAL(15,2),
    created_at DATETIME NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    INDEX idx_rfq_number (rfq_number),
    INDEX idx_status (status),
    INDEX idx_client_name (client_name),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted)
);

-- Insert test data
INSERT INTO simple_rfqs (rfq_id, rfq_number, title, client_name, status, estimated_value, created_at) VALUES 
(UUID(), 'RFQ000001', 'Test RFQ 1 - Structural Steel', 'Test Client A', 'DRAFT', 50000.00, NOW()),
(UUID(), 'RFQ000002', 'Test RFQ 2 - Pressure Vessel', 'Test Client B', 'UNDER_REVIEW', 75000.00, NOW()),
(UUID(), 'RFQ000003', 'Test RFQ 3 - Conveyor System', 'Test Client C', 'READY_FOR_QUOTE', 120000.00, NOW());

SELECT 'Simple RFQ Table Created with Test Data' as status;
SELECT COUNT(*) as total_rfqs FROM simple_rfqs;
