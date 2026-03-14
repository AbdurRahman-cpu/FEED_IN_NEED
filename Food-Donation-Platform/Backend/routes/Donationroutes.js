const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');

// ── Email transporter ──
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abdurrahman11001111111@gmail.com',
        pass: 'xhkejfaejhfamfjv'  // app password (spaces removed)
    }
});

const sendEmail = (to, subject, html) => {
    return transporter.sendMail({
        from: '"Feed In Need 🍽" <abdurrahman11001111111@gmail.com>',
        to,
        subject,
        html
    });
};

// ── POST /api/donations ── (Donor submits donation)
router.post('/', async (req, res) => {
    const { donorName, phone, location, foodType, foodQuantity, ngo_id, ngo_name } = req.body;

    if (!donorName || !phone || !location || !foodQuantity || !ngo_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Phone must be a valid 10-digit number' });
    }

    try {
        // Validate NGO exists and get their email
        const [ngoRows] = await db.query('SELECT * FROM ngos WHERE id = ?', [ngo_id]);
        if (ngoRows.length === 0) {
            return res.status(404).json({ error: 'Selected NGO not found' });
        }

        const ngo = ngoRows[0];

        // Insert donation
        const [result] = await db.query(
            `INSERT INTO donations (donor_name, phone, location, food_type, food_quantity, ngo_id, ngo_name, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [donorName, phone, location, foodType, foodQuantity, ngo_id, ngo_name]
        );

        // ── Email to NGO ──
        try {
            await sendEmail(
                ngo.email,
                '🍱 New Food Donation Received - Feed In Need',
                `
                <div style="font-family: Segoe UI, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 28px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🍽 Feed In Need</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0;">New Donation Alert</p>
                    </div>
                    <div style="padding: 28px;">
                        <h2 style="color: #2e7d32; margin-bottom: 16px;">You have a new food donation!</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #f1f8e9;">
                                <td style="padding: 10px 14px; font-weight: 600; color: #555; border-radius: 6px;">👤 Donor</td>
                                <td style="padding: 10px 14px; color: #222;">${donorName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 14px; font-weight: 600; color: #555;">📞 Phone</td>
                                <td style="padding: 10px 14px; color: #222;">${phone}</td>
                            </tr>
                            <tr style="background: #f1f8e9;">
                                <td style="padding: 10px 14px; font-weight: 600; color: #555;">📍 Pickup Location</td>
                                <td style="padding: 10px 14px; color: #222;">${location}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 14px; font-weight: 600; color: #555;">🍱 Food</td>
                                <td style="padding: 10px 14px; color: #222;">${foodType || 'Not specified'}</td>
                            </tr>
                            <tr style="background: #f1f8e9;">
                                <td style="padding: 10px 14px; font-weight: 600; color: #555;">📦 Quantity</td>
                                <td style="padding: 10px 14px; color: #222;">${foodQuantity}</td>
                            </tr>
                        </table>
                        <p style="margin-top: 24px; color: #777; font-size: 13px;">Please arrange pickup or wait for a volunteer to collect this donation. Log in to your NGO dashboard to track status.</p>
                    </div>
                    <div style="background: #e8f5e9; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                        Feed In Need Platform · Connecting donors with NGOs
                    </div>
                </div>
                `
            );
        } catch (emailErr) {
            console.error('Email to NGO failed:', emailErr.message);
            // Don't fail the request if email fails
        }

        res.status(201).json({ message: 'Donation submitted successfully!', id: result.insertId });
    } catch (err) {
        console.error('Error saving donation:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ── GET /api/donations ── (get all donations)
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM donations ORDER BY created_at DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching donations:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ── PATCH /api/donations/:id/collect ── (NGO marks as collected)
router.patch('/:id/collect', async (req, res) => {
    const { id } = req.params;

    try {
        const [donationRows] = await db.query('SELECT * FROM donations WHERE id = ?', [id]);
        if (donationRows.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        await db.query(`UPDATE donations SET status = 'collected' WHERE id = ?`, [id]);

        res.json({ message: 'Donation marked as collected' });
    } catch (err) {
        console.error('Error updating donation:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ── PATCH /api/donations/:id/claim ── (Volunteer claims a pickup task)
router.patch('/:id/claim', async (req, res) => {
    const { id } = req.params;
    const { volunteer_id, volunteer_name } = req.body;

    if (!volunteer_id || !volunteer_name) {
        return res.status(400).json({ error: 'Volunteer info required' });
    }

    try {
        const [donationRows] = await db.query('SELECT * FROM donations WHERE id = ?', [id]);
        if (donationRows.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        const donation = donationRows[0];

        if (donation.volunteer_id) {
            return res.status(409).json({ error: 'This task has already been claimed by another volunteer' });
        }

        // Update donation with volunteer info
        await db.query(
            `UPDATE donations SET volunteer_id = ?, volunteer_name = ?, status = 'claimed' WHERE id = ?`,
            [volunteer_id, volunteer_name, id]
        );

        // Get NGO email
        const [ngoRows] = await db.query('SELECT * FROM ngos WHERE id = ?', [donation.ngo_id]);
        const ngoEmail = ngoRows[0]?.email;

        // ── Email to NGO about volunteer ──
        if (ngoEmail) {
            try {
                await sendEmail(
                    ngoEmail,
                    '🚚 A Volunteer Has Accepted a Pickup - Feed In Need',
                    `
                    <div style="font-family: Segoe UI, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #29b6f6, #0277bd); padding: 28px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">🍽 Feed In Need</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0;">Volunteer Pickup Update</p>
                        </div>
                        <div style="padding: 28px;">
                            <h2 style="color: #0277bd; margin-bottom: 16px;">A volunteer is on the way! 🚚</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr style="background: #e3f2fd;">
                                    <td style="padding: 10px 14px; font-weight: 600; color: #555;">🙋 Volunteer</td>
                                    <td style="padding: 10px 14px; color: #222;">${volunteer_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; font-weight: 600; color: #555;">👤 Donor</td>
                                    <td style="padding: 10px 14px; color: #222;">${donation.donor_name}</td>
                                </tr>
                                <tr style="background: #e3f2fd;">
                                    <td style="padding: 10px 14px; font-weight: 600; color: #555;">📍 Pickup From</td>
                                    <td style="padding: 10px 14px; color: #222;">${donation.location}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; font-weight: 600; color: #555;">🍱 Food</td>
                                    <td style="padding: 10px 14px; color: #222;">${donation.food_type || 'Not specified'} · ${donation.food_quantity}</td>
                                </tr>
                            </table>
                            <p style="margin-top: 24px; color: #777; font-size: 13px;">The volunteer will collect the food and deliver it to your NGO. Please be ready to receive it.</p>
                        </div>
                        <div style="background: #e3f2fd; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                            Feed In Need Platform · Connecting donors with NGOs
                        </div>
                    </div>
                    `
                );
            } catch (emailErr) {
                console.error('Email to NGO failed:', emailErr.message);
            }
        }

        res.json({ message: 'Task claimed successfully!', volunteer_name });
    } catch (err) {
        console.error('Error claiming task:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;