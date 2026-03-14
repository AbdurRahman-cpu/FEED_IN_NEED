const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// GET /api/volunteers
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM volunteers ORDER BY id DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching volunteers:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/volunteers/register
router.post('/register', async (req, res) => {
    const { fullName, phone, city, state } = req.body;

    if (!fullName || !phone || !city || !state) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Phone must be a valid 10-digit number' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM volunteers WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Phone number already registered' });
        }

        const [result] = await db.query(
            'INSERT INTO volunteers (full_name, phone, city, state) VALUES (?, ?, ?, ?)',
            [fullName, phone, city, state]
        );

        res.status(201).json({ message: 'Volunteer registered successfully!', id: result.insertId });
    } catch (err) {
        console.error('Error registering volunteer:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/volunteers/login
router.post('/login', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
    }

    try {
        const [results] = await db.query('SELECT * FROM volunteers WHERE phone = ?', [phone]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Phone number not registered. Please register first.' });
        }

        const volunteer = results[0];

        // ✅ Always send fullName in camelCase so frontend can read it reliably
        res.json({
            message: 'Login successful',
            id: volunteer.id,
            fullName: volunteer.full_name,
            phone: volunteer.phone,
            city: volunteer.city,
            state: volunteer.state
        });
    } catch (err) {
        console.error('Volunteer login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;