const mysql = require('mysql2');

// ✅ Use promise-based pool so all routes can use async/await cleanly
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mohammed',
    database: 'feed_in_need'
}).promise();

module.exports = db;