const express = require('express');
const app = express();
const PORT = 3099;

console.log('Starting test server...');

app.get('/', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Server will stay running for 10 seconds...');
  
  setTimeout(() => {
    console.log('Test complete - closing server');
    server.close();
    process.exit(0);
  }, 10000);
});

console.log('After app.listen call');
