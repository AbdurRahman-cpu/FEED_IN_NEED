require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false  // ✅ fixes self-signed certificate error
    }
});

transporter.sendMail({
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'Test Email',
    text: 'Email is working!'
}, (err, info) => {
    if (err) {
        console.error('❌ Failed:', err.message);
    } else {
        console.log('✅ Success:', info.response);
    }
});

require('dotenv').config();
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);