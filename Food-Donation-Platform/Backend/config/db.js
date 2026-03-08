const mysql = require('mysql2');

// Create a connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mohammed',
    database: 'feed_in_need'
});

module.exports = db;