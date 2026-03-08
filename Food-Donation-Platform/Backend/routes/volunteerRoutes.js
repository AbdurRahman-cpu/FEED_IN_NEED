const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// POST /api/volunteers/register
router.post('/register', (req, res) => {
    const { fullName, phone, city, state } = req.body;

    if (!fullName || !phone || !city || !state) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if phone already registered
    db.query('SELECT id FROM volunteers WHERE phone = ?', [phone], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: 'Phone number already registered' });
        }

        const sql = `
            INSERT INTO volunteers (full_name, phone, city, state)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [fullName, phone, city, state], (err, result) => {
            if (err) {
                console.error('Error inserting volunteer:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Volunteer registered successfully!' });
        });
    });
});

module.exports = router;