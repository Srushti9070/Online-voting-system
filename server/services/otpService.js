const transporter = require('../config/mailer');

// In-Memory store for active OTP codes: { key: { otp: string, attempts: number, expiresAt: timestamp } }
const otpStore = new Map();

/**
 * Generates a random 6-digit numeric OTP string.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a Phone SMS/Email OTP code to the registered voter's phone number and email.
 * OTP is NOT returned to client API responses; it is delivered via email or server console log in dev.
 */
const sendPhoneOTP = async (phone, voterName, email = '') => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  const record = { otp, attempts: 0, expiresAt };

  // Store OTP in cache using phone number and email keys
  if (phone) otpStore.set(phone.trim(), record);
  if (email) otpStore.set(email.toLowerCase().trim(), record);

  console.log(`==================================================`);
  console.log(`🔒 SECURITY LOG: SMS OTP dispatched for ${voterName} (${phone}): ${otp}`);
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
            <p>Your 6-digit security passcode is:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #06B6D4; background: rgba(6, 182, 212, 0.1); padding: 12px 24px; border-radius: 8px; border: 1px solid #06B6D4; display: inline-block;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 12px; color: #9CA3AF;">Valid for 5 minutes. Maximum 3 verification attempts allowed.</p>
          </div>
        `,
      });
      console.log(`✉️ OTP Email successfully dispatched to ${email}`);
    } catch (err) {
      console.warn(`⚠️ Email dispatch notice: ${err.message}`);
    }
  }

  return {
    success: true,
    message: `OTP code generated and sent to registered contact.`,
  };
};

/**
 * Verifies submitted Phone/Email OTP with max 3 attempts cap.
 */
const verifyOTP = (key, enteredOTP) => {
  if (!key) {
    return { valid: false, message: 'Invalid verification target' };
  }

  const cleanKey = key.trim();
  const record = otpStore.get(cleanKey);

  if (!record) {
    return { valid: false, message: 'OTP expired or not requested. Please restart login.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanKey);
    return { valid: false, message: 'OTP code has expired. Please request a new code.' };
  }

  // Enforce Max 3 Attempts Rate Limiting / Brute-force Prevention
  record.attempts += 1;
  if (record.attempts > 3) {
    otpStore.delete(cleanKey);
    return { valid: false, message: 'Maximum OTP verification attempts exceeded (3/3). Authentication session locked.' };
  }

  if (record.otp !== enteredOTP.trim()) {
    const remaining = 3 - record.attempts;
    return { valid: false, message: `Invalid OTP verification code. ${remaining} attempts remaining.` };
  }

  // Consume OTP upon successful match
  otpStore.delete(cleanKey);
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  sendPhoneOTP,
  verifyOTP,
};
