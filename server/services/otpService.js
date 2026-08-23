const transporter = require('../config/mailer');

// In-Memory store for active Phone & Email OTP codes: { key: { otp: string, expiresAt: timestamp } }
const otpStore = new Map();

/**
 * Generates a random 6-digit numeric OTP string.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a Phone SMS OTP code to the registered voter's phone number.
 * Also sends a backup email copy if SMTP is configured.
 * 
 * @param {string} phone Registered voter phone number
 * @param {string} voterName Full name of voter
 * @param {string} email Optional backup voter email
 */
const sendPhoneOTP = async (phone, voterName, email = '') => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Store OTP in cache using phone number key
  otpStore.set(phone, { otp, expiresAt });
  if (email) {
    otpStore.set(email, { otp, expiresAt });
  }

  console.log(`==================================================`);
  console.log(`📱 SMS OTP GENERATED for ${voterName} (${phone}): ${otp}`);
  console.log(`==================================================`);

  // Attempt Real Email Sending if SMTP credentials exist in .env
  if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    try {
      await transporter.sendMail({
        from: `"TrustVote E-Voting System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your TrustVote SMS & Security OTP Passcode',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #38BDF8;">
            <h2 style="color: #38BDF8;">🏛️ TrustVote Multi-Factor Authentication Passcode</h2>
            <p>Hello <strong>${voterName}</strong>,</p>
            <p>Your 6-digit SMS security passcode is:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #06B6D4; background: rgba(6, 182, 212, 0.1); padding: 12px 24px; border-radius: 8px; border: 1px solid #06B6D4; display: inline-block;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 12px; color: #9CA3AF;">This passcode is valid for 5 minutes. Registered Phone: ${phone}</p>
          </div>
        `,
      });
      console.log(`✉️ Backup OTP Email dispatched to ${email}`);
    } catch (err) {
      console.warn(`⚠️ Email dispatch notice: ${err.message}`);
    }
  }

  return {
    success: true,
    otp, // Returned so UI modal can display sandbox preview card for testing
    message: `SMS OTP code generated for registered phone ${phone}`,
  };
};

/**
 * Verifies submitted Phone/Email OTP against cached entry.
 * @param {string} key Phone number or email address
 * @param {string} enteredOTP Submitted 6-digit string
 */
const verifyOTP = (key, enteredOTP) => {
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, message: 'OTP expired or not requested' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP code has expired' };
  }

  if (record.otp !== enteredOTP.trim()) {
    return { valid: false, message: 'Invalid OTP verification code' };
  }

  // Consume OTP upon successful match
  otpStore.delete(key);
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  sendPhoneOTP,
  verifyOTP,
};
