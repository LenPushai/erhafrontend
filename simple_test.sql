USE erha_ops;
INSERT INTO rfqs (jobNo, description, estimatedValue, status, department, isDeleted, createdAt) VALUES 
('TEST-001', 'Test RFQ', 1000.00, 'DRAFT', 'TEST', 0, NOW());
SELECT * FROM rfqs WHERE jobNo = 'TEST-001';
