const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
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

// POST /api/ngos/register
router.post('/register', upload.single('certificate'), async (req, res) => {
    const { org_name, org_address, email, phone, password } = req.body;
    const certificatePath = req.file ? req.file.path : null;

    if (!org_name || !org_address || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if email already exists
        db.query('SELECT id FROM ngos WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO ngos (org_name, org_address, email, phone, password, certificate_path)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [org_name, org_address, email, phone, hashedPassword, certificatePath], (err) => {
                if (err) {
                    console.error('Error inserting NGO:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json({ message: 'NGO registered successfully!' });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;