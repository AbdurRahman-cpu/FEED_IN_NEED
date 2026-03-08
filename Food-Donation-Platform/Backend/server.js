const express = require('express');
const cors = require('cors');
const ngoRoutes = require('./routes/ngoRoutes.js');
const volunteerRoutes = require('./routes/volunteerRoutes.js');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);

app.listen(5000, () => {
    console.log('Backend running at http://localhost:5000');
});

const fs = require('fs');

// Auto-create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads/certificates')) {
    fs.mkdirSync('./uploads/certificates', { recursive: true });
}