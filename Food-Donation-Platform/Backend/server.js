require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const ngoRoutes = require('./routes/ngoRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const donationRoutes = require('./routes/Donationroutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded certificate images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);

// ✅ Global error handler — catches multer errors, unhandled throws, etc.
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(5000, () => {
    console.log('Backend running at http://localhost:5000');
});