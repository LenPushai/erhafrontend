const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool (better for production)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Speedy01',
    database: process.env.DB_NAME || 'erha_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('✓ Connected to MySQL database');
    connection.release();
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running' });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
    const query = 'SELECT * FROM erhadata ORDER BY jobNo';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            res.status(500).json({ error: 'Failed to fetch jobs' });
            return;
        }
        res.json(results);
    });
});

// Get single job by jobNo
app.get('/api/jobs/:jobNo', (req, res) => {
    const { jobNo } = req.params;
    const query = 'SELECT * FROM erhadata WHERE jobNo = ?';
    
    db.query(query, [jobNo], (err, results) => {
        if (err) {
            console.error('Error fetching job:', err);
            res.status(500).json({ error: 'Failed to fetch job' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Get jobs by status (APPROVED or PENDING)
app.get('/api/jobs/status/:status', (req, res) => {
    const { status } = req.params;
    const query = 'SELECT * FROM erhadata WHERE status = ? ORDER BY jobNo';
    
    db.query(query, [status.toUpperCase()], (err, results) => {
        if (err) {
            console.error('Error fetching jobs by status:', err);
            res.status(500).json({ error: 'Failed to fetch jobs' });
            return;
        }
        res.json(results);
    });
});

// Create new job
app.post('/api/jobs', (req, res) => {
    const { jobNo, description, estimatedValue, status } = req.body;
    
    // Validation
    if (!jobNo || !description) {
        return res.status(400).json({ error: 'Job number and description are required' });
    }
    
    const query = 'INSERT INTO erhadata (jobNo, description, estimatedValue, status) VALUES (?, ?, ?, ?)';
    const values = [
        jobNo,
        description,
        estimatedValue || 0,
        status || 'PENDING'
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Job number already exists' });
            }
            console.error('Error creating job:', err);
            res.status(500).json({ error: 'Failed to create job' });
            return;
        }
        res.status(201).json({ 
            message: 'Job created successfully', 
            jobNo: jobNo 
        });
    });
});

// Update job
app.put('/api/jobs/:jobNo', (req, res) => {
    const { jobNo } = req.params;
    const { description, estimatedValue, status } = req.body;
    
    // Build dynamic update query based on provided fields
    let updateFields = [];
    let values = [];
    
    if (description !== undefined) {
        updateFields.push('description = ?');
        values.push(description);
    }
    if (estimatedValue !== undefined) {
        updateFields.push('estimatedValue = ?');
        values.push(estimatedValue);
    }
    if (status !== undefined) {
        updateFields.push('status = ?');
        values.push(status);
    }
    
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(jobNo);
    const query = `UPDATE erhadata SET ${updateFields.join(', ')} WHERE jobNo = ?`;
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating job:', err);
            res.status(500).json({ error: 'Failed to update job' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        res.json({ message: 'Job updated successfully' });
    });
});

// Delete job
app.delete('/api/jobs/:jobNo', (req, res) => {
    const { jobNo } = req.params;
    const query = 'DELETE FROM erhadata WHERE jobNo = ?';
    
    db.query(query, [jobNo], (err, result) => {
        if (err) {
            console.error('Error deleting job:', err);
            res.status(500).json({ error: 'Failed to delete job' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        res.json({ message: 'Job deleted successfully' });
    });
});

// Get summary statistics
app.get('/api/stats', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as totalJobs,
            SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approvedJobs,
            SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingJobs,
            COALESCE(SUM(estimatedValue), 0) as totalValue,
            COALESCE(AVG(estimatedValue), 0) as averageValue,
            COALESCE(MAX(estimatedValue), 0) as maxValue,
            COALESCE(MIN(estimatedValue), 0) as minValue
        FROM erhadata
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stats:', err);
            res.status(500).json({ error: 'Failed to fetch statistics' });
            return;
        }
        res.json(results[0]);
    });
});

// Search jobs by description
app.get('/api/jobs/search/:term', (req, res) => {
    const { term } = req.params;
    const query = 'SELECT * FROM erhadata WHERE description LIKE ? ORDER BY jobNo';
    const searchTerm = `%${term}%`;
    
    db.query(query, [searchTerm], (err, results) => {
        if (err) {
            console.error('Error searching jobs:', err);
            res.status(500).json({ error: 'Failed to search jobs' });
            return;
        }
        res.json(results);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✓ API Server running on http://localhost:${PORT}`);
    console.log('\n📍 Available endpoints:');
    console.log('  GET    /api/health              - Health check');
    console.log('  GET    /api/jobs                - Get all jobs');
    console.log('  GET    /api/jobs/:jobNo         - Get specific job');
    console.log('  GET    /api/jobs/status/:status - Get jobs by status');
    console.log('  GET    /api/jobs/search/:term   - Search jobs by description');
    console.log('  POST   /api/jobs                - Create new job');
    console.log('  PUT    /api/jobs/:jobNo         - Update job');
    console.log('  DELETE /api/jobs/:jobNo         - Delete job');
    console.log('  GET    /api/stats               - Get statistics\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.end(() => {
        console.log('Database connections closed.');
        process.exit(0);
    });
});