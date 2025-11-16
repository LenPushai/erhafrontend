const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Speedy01',
    database: 'erha_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    
    console.log('Connected to MySQL database');
    
    // Get all jobs/RFQs
    const query = 'SELECT * FROM erhadata ORDER BY jobNo';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Query failed:', err);
            return;
        }
        
        console.log(`\nTotal Records: ${results.length}`);
        
        // Calculate statistics
        const stats = {
            total: results.length,
            pending: results.filter(r => r.status === 'PENDING').length,
            approved: results.filter(r => r.status === 'APPROVED').length,
            inProgress: results.filter(r => r.status === 'IN_PROGRESS').length,
            completed: results.filter(r => r.status === 'COMPLETED').length,
            totalValue: results.reduce((sum, r) => sum + (parseFloat(r.estimatedValue) || 0), 0)
        };
        
        console.log('\n=== Database Statistics ===');
        console.log(`Total RFQs: ${stats.total}`);
        console.log(`Pending: ${stats.pending}`);
        console.log(`Approved: ${stats.approved}`);
        console.log(`In Progress: ${stats.inProgress}`);
        console.log(`Completed: ${stats.completed}`);
        console.log(`Total Value: R${stats.totalValue.toLocaleString()}`);
        console.log(`Active RFQs (Pending + In Progress): ${stats.pending + stats.inProgress}`);
        
        console.log('\n=== Individual Records ===');
        results.forEach(row => {
            console.log(`${row.jobNo}: ${row.status} - R${row.estimatedValue || 0} - ${row.description.substring(0, 50)}...`);
        });
        
        connection.end();
    });
});
