-- ERHA Job Service Database Schema
-- MySQL Version

-- Create database
CREATE DATABASE IF NOT EXISTS erha_job_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erha_job_db;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS work_progress;
DROP TABLE IF EXISTS jobs;

-- Create jobs table
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_number VARCHAR(10) UNIQUE NOT NULL,
    quote_id BIGINT,
    quote_number VARCHAR(20),
    rfq_number VARCHAR(20),
    client_name VARCHAR(255) NOT NULL,
    description TEXT,
    order_number VARCHAR(50),
    order_date DATETIME,
    value_excl DECIMAL(19,2),
    value_incl DECIMAL(19,2),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    progress_percentage INT DEFAULT 0,
    expected_delivery_date DATETIME,
    actual_delivery_date DATETIME,
    location VARCHAR(20),
    priority VARCHAR(10) DEFAULT 'MEDIUM',
    invoice_number VARCHAR(20),
    delivery_note_number VARCHAR(20),
    remarks TEXT,
    created_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_job_number (job_number),
    INDEX idx_status (status),
    INDEX idx_client_name (client_name),
    INDEX idx_quote_id (quote_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create work_progress table
CREATE TABLE work_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    progress_date DATETIME NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    progress_percentage INT,
    hours_worked DOUBLE,
    notes TEXT,
    reported_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_progress_date (progress_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create test database for unit tests
CREATE DATABASE IF NOT EXISTS erha_test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists and grant privileges
CREATE USER IF NOT EXISTS 'erha_user'@'localhost' IDENTIFIED BY 'erha_password';
GRANT ALL PRIVILEGES ON erha_job_db.* TO 'erha_user'@'localhost';
GRANT ALL PRIVILEGES ON erha_test_db.* TO 'erha_user'@'localhost';
FLUSH PRIVILEGES;

-- Insert sample data for testing
INSERT INTO jobs (
    job_number, quote_id, quote_number, rfq_number, client_name, 
    description, order_number, order_date, value_excl, value_incl, 
    status, progress_percentage, expected_delivery_date, location, priority
) VALUES
    ('24-001', 1, 'NE008890', 'RFQ-2024-050', 'CG-Mills', 
     'Safety Platform - Area 3', 'PO-CG-12345', '2024-09-28 10:00:00', 
     42350.00, 48702.50, 'IN_PROGRESS', 65, '2024-10-20 17:00:00', 'Shop', 'MEDIUM'),
    
    ('24-002', 2, 'NE008891', 'RFQ-2024-051', 'Sasol', 
     'Pipe Support Structure', 'PO-SAS-9876', '2024-09-30 14:30:00', 
     28500.00, 32775.00, 'NEW', 0, '2024-10-25 17:00:00', 'Site', 'HIGH'),
    
    ('24-003', 3, 'NE008892', 'RFQ-2024-052', 'ArcelorMittal', 
     'Conveyor Belt Frame', 'PO-AM-5544', '2024-10-01 09:15:00', 
     67800.00, 77970.00, 'QUALITY_CHECK', 90, '2024-10-15 17:00:00', 'Both', 'URGENT');

-- Insert sample progress records
INSERT INTO work_progress (
    job_id, progress_date, previous_status, new_status, 
    progress_percentage, hours_worked, notes, reported_by
) VALUES
    (1, '2024-10-02 08:30:00', 'NEW', 'IN_PROGRESS', 
     10, 4.5, 'Started fabrication of main frame', 'T. Molefe'),
    (1, '2024-10-05 15:45:00', 'IN_PROGRESS', 'IN_PROGRESS', 
     65, 18.0, 'Main frame welding complete, starting platform decking', 'T. Molefe'),
    (3, '2024-10-08 11:20:00', 'IN_PROGRESS', 'QUALITY_CHECK', 
     90, 32.5, 'All fabrication complete, sent for quality inspection', 'J. Botha');

-- Display confirmation
SELECT 'Database setup complete!' AS Status;
SELECT COUNT(*) AS 'Jobs Created' FROM jobs;
SELECT COUNT(*) AS 'Progress Records' FROM work_progress;
