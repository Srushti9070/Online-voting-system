const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyFaceMatch } = require('../services/faceService');
const { sendPhoneOTP, verifyOTP } = require('../services/otpService');
const { hashVoterCardDocument } = require('../utils/hashUtils');

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing! Using strict fail-safe fallback.');
    return 'trustvote_production_secure_jwt_secret_key_2026_fallback';
  }
  return secret;
};

/**
 * Generates a signed JWT authentication token for logged-in sessions.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, getJWTSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

/**
 * Generates a short-lived signed MFA Challenge Token (5 min validity)
 * Binds multi-factor step 1 -> step 2 -> step 3 -> step 4 together.
 */
const generateChallengeToken = (voterId, step) => {
  return jwt.sign({ voterId, step, purpose: 'MFA_CHALLENGE' }, getJWTSecret(), {
    expiresIn: '5m',
  });
};

/**
 * Verifies MFA Challenge Token for step progression.
 */
const verifyChallengeToken = (token, expectedStep) => {
  if (!token) return { valid: false, message: 'MFA Challenge Token is missing' };
  try {
    const decoded = jwt.verify(token, getJWTSecret());
    if (decoded.purpose !== 'MFA_CHALLENGE') return { valid: false, message: 'Invalid token purpose' };
    if (decoded.step < expectedStep - 1) return { valid: false, message: 'Prerequisite MFA step not completed' };
    return { valid: true, voterId: decoded.voterId };
  } catch (err) {
    return { valid: false, message: 'MFA Challenge session expired or invalid. Please restart login.' };
  }
};

// @desc    Register a new voter with Voter Card Hash, face descriptor, phone number, and location
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, voterId, email, phone, password, faceDescriptor, locationId, voterCardData } = req.body;

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
      message: 'Voter registration completed successfully.',
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
    console.error(`❌ Registration Error:`, error);
    res.status(500).json({ success: false, message: 'Server error during voter registration. Please try again.' });
  }
};

// @desc    Login Step 1: Verify Voter ID & Password -> Issues Signed MFA Challenge Token
// @route   POST /api/auth/login-step1
// @access  Public
const loginStep1 = async (req, res) => {
  try {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({ success: false, message: 'Voter ID and password are required' });
    }

    const user = await User.findOne({ voterId: voterId.toUpperCase() }).select('+password').populate('location');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or Password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or Password' });
    }

    // Issue signed short-lived MFA challenge token
    const challengeToken = generateChallengeToken(user.voterId, 1);

    res.status(200).json({
      success: true,
      step: 2,
      message: 'Credentials verified. Please scan your official Voter ID Card.',
      challengeToken,
      voterId: user.voterId,
      phone: user.phone.replace(/.(?=.{4})/g, '*'), // Masked phone for UI preview
    });
  } catch (error) {
    console.error(`❌ Step 1 Error:`, error);
    res.status(500).json({ success: false, message: 'Authentication error. Please try again.' });
  }
};

// @desc    Login Step 2: Verify Cryptographic Voter Card Document Hash -> Requires Challenge Token
// @route   POST /api/auth/verify-card
// @access  Public
const verifyVoterCardStep = async (req, res) => {
  try {
    const { challengeToken, scannedCardData } = req.body;

    const tokenVerification = verifyChallengeToken(challengeToken, 2);
    if (!tokenVerification.valid) {
      return res.status(401).json({ success: false, message: tokenVerification.message });
    }

    const voterId = tokenVerification.voterId;
    const user = await User.findOne({ voterId: voterId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    const computedCardHash = hashVoterCardDocument(voterId, scannedCardData || voterId);
    if (computedCardHash !== user.voterCardHash) {
      return res.status(401).json({
        success: false,
        message: 'Voter Card Document mismatch! Scanned Card ID does not match registered Voter ID records.'
      });
    }

    const nextChallengeToken = generateChallengeToken(voterId, 2);

    res.status(200).json({
      success: true,
      step: 3,
      message: 'Voter Card verified. Please proceed to Biometric Face Scan.',
      challengeToken: nextChallengeToken,
      voterId: user.voterId,
    });
  } catch (error) {
    console.error(`❌ Step 2 Error:`, error);
    res.status(500).json({ success: false, message: 'Card verification error. Please try again.' });
  }
};

// @desc    Login Step 3: Biometric Face Verification -> Requires Challenge Token -> Dispatches OTP
// @route   POST /api/auth/verify-face
// @access  Public
const verifyFaceStep = async (req, res) => {
  try {
    const { challengeToken, liveFaceDescriptor } = req.body;

    const tokenVerification = verifyChallengeToken(challengeToken, 3);
    if (!tokenVerification.valid) {
      return res.status(401).json({ success: false, message: tokenVerification.message });
    }

    const voterId = tokenVerification.voterId;
    const user = await User.findOne({ voterId: voterId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    const matchResult = verifyFaceMatch(user.faceDescriptor, liveFaceDescriptor);
    if (!matchResult.isMatch) {
      return res.status(401).json({
        success: false,
        message: matchResult.message,
        confidenceScore: matchResult.confidenceScore
      });
    }

    // Face matched! Dispatch OTP to registered phone and email securely (NO fallbackOtp in response)
    await sendPhoneOTP(user.phone, user.fullName, user.email);

    const nextChallengeToken = generateChallengeToken(voterId, 3);

    res.status(200).json({
      success: true,
      step: 4,
      message: 'Face verification passed. Security passcode dispatched to registered contact.',
      challengeToken: nextChallengeToken,
      phone: user.phone,
      confidenceScore: matchResult.confidenceScore,
    });
  } catch (error) {
    console.error(`❌ Step 3 Error:`, error);
    res.status(500).json({ success: false, message: 'Face verification error. Please try again.' });
  }
};

// @desc    Login Step 4: Verify Phone/Email OTP Code -> Requires Challenge Token -> Issue JWT Session Token
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPStep = async (req, res) => {
  try {
    const { challengeToken, otp } = req.body;

    const tokenVerification = verifyChallengeToken(challengeToken, 4);
    if (!tokenVerification.valid) {
      return res.status(401).json({ success: false, message: tokenVerification.message });
    }

    const voterId = tokenVerification.voterId;
    const user = await User.findOne({ voterId: voterId.toUpperCase() }).populate('location');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    const verification = verifyOTP(user.phone, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

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
    console.error(`❌ Step 4 Error:`, error);
    res.status(500).json({ success: false, message: 'OTP verification error. Please try again.' });
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
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
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
