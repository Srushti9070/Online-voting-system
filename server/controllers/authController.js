const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyFaceMatch } = require('../services/faceService');
const { sendPhoneOTP, verifyOTP } = require('../services/otpService');
const { hashVoterCardDocument } = require('../utils/hashUtils');

/**
 * Generates a signed JWT authentication token.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_voting_system_jwt_key_2026_secure_key', {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

// @desc    Register a new voter with Voter Card Hash, face descriptor, phone number, and location
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, voterId, email, phone, password, faceDescriptor, locationId, voterCardData } = req.body;

    // Check if user already exists with Voter ID, Email, or Phone
    const existingUser = await User.findOne({ $or: [{ voterId }, { email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this Voter ID, Email, or Phone Number already exists.'
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Biometric face registration descriptor vector is required.'
      });
    }

    // Generate Cryptographic SHA-256 Voter Card Hash
    const voterCardHash = hashVoterCardDocument(voterId, voterCardData || voterId);

    const user = await User.create({
      fullName,
      voterId: voterId.toUpperCase(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      password,
      faceDescriptor,
      voterCardHash,
      location: locationId,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Voter registration completed successfully with registered Voter Card, biometric face profile, and phone number.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        voterId: user.voterId,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error(`❌ Registration Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login Step 1: Verify Voter ID & Password -> Triggers Voter Card Scan Challenge
// @route   POST /api/auth/login-step1
// @access  Public
const loginStep1 = async (req, res) => {
  try {
    const { voterId, password } = req.body;

    const user = await User.findOne({ voterId: voterId.toUpperCase() }).select('+password').populate('location');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or Password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or Password' });
    }

    res.status(200).json({
      success: true,
      step: 2,
      message: 'Credentials verified. Please scan your official Voter ID Card.',
      voterId: user.voterId,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login Step 2: Verify Cryptographic Voter Card Document Hash -> Triggers Face Challenge
// @route   POST /api/auth/verify-card
// @access  Public
const verifyVoterCardStep = async (req, res) => {
  try {
    const { voterId, scannedCardData } = req.body;

    const user = await User.findOne({ voterId: voterId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    // Recompute hash from scanned Voter Card document
    const computedCardHash = hashVoterCardDocument(voterId, scannedCardData || voterId);

    if (computedCardHash !== user.voterCardHash) {
      return res.status(401).json({
        success: false,
        message: 'Voter Card Document mismatch! Scanned Card ID does not match registered Voter ID records.'
      });
    }

    res.status(200).json({
      success: true,
      step: 3,
      message: 'Voter Card verified. Please proceed to Biometric Face Scan.',
      voterId: user.voterId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login Step 3: Biometric Face Verification -> Triggers SMS/Email OTP to Registered Phone & Email
// @route   POST /api/auth/verify-face
// @access  Public
const verifyFaceStep = async (req, res) => {
  try {
    const { voterId, liveFaceDescriptor } = req.body;

    const user = await User.findOne({ voterId: voterId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    const matchResult = verifyFaceMatch(user.faceDescriptor, liveFaceDescriptor);

    if (!matchResult.isMatch) {
      return res.status(401).json({
        success: false,
        message: matchResult.message,
        distance: matchResult.distance,
        confidenceScore: matchResult.confidenceScore
      });
    }

    // Face matched! Dispatch Phone & Email OTP code
    const otpRes = await sendPhoneOTP(user.phone, user.fullName, user.email);

    res.status(200).json({
      success: true,
      step: 4,
      message: 'Face verification passed. OTP dispatched to registered phone number and email.',
      phone: user.phone,
      email: user.email,
      confidenceScore: matchResult.confidenceScore,
      fallbackOtp: otpRes.otp // Provided for testing preview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login Step 4: Verify Phone/Email OTP Code -> Issue JWT Session Token
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPStep = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    const key = phone || email;
    const verification = verifyOTP(key, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const user = await User.findOne({ $or: [{ phone: phone ? phone.trim() : '' }, { email: email ? email.toLowerCase() : '' }] }).populate('location');
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Multi-Factor Authentication complete. Access Granted.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        voterId: user.voterId,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged-in User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('location');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginStep1,
  verifyVoterCardStep,
  verifyFaceStep,
  verifyOTPStep,
  getMe,
};
