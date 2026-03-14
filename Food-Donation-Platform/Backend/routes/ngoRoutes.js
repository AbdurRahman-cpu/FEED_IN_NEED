const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configure multer for certificate file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed'));
        }
    }
});

// GET /api/ngos  (for Donor Dashboard)
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT id, org_name, org_address, email, phone, certificate_path, created_at FROM ngos ORDER BY created_at DESC'
        );
        res.json(results);
    } catch (err) {
        console.error('Error fetching NGOs:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/ngos/register
router.post('/register', upload.single('certificate'), async (req, res) => {
    const { org_name, org_address, email, phone, password } = req.body;
    const certificatePath = req.file ? req.file.path : null;

    // ✅ Check required fields FIRST before anything else
    if (!org_name || !org_address || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Then validate password format (safe — password is confirmed non-null above)
    if (password.length !== 6) {
        return res.status(400).json({ error: 'Password must be exactly 6 digits' });
    }

    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM ngos WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO ngos (org_name, org_address, email, phone, password, certificate_path)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [org_name, org_address, email, phone, hashedPassword, certificatePath]);
        res.status(201).json({ message: 'NGO registered successfully!' });
    } catch (err) {
        console.error('Error registering NGO:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ POST /api/ngos/login  (was missing before)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [results] = await db.query('SELECT * FROM ngos WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const ngo = results[0];
        const match = await bcrypt.compare(password, ngo.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            ngo_id: ngo.id,
            org_name: ngo.org_name,
            email: ngo.email
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;