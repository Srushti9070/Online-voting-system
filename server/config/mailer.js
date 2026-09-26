const nodemailer = require('nodemailer');

/**
 * Nodemailer Transporter Configuration
 * Uses Gmail SMTP by default for 100% Free OTP Email Dispatch (Up to 500 emails/day).
 * Configured via EMAIL_USER and EMAIL_PASS in server/.env
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_16_character_app_password',
  },
});

module.exports = transporter;
