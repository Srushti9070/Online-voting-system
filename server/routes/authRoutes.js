const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginStep1,
  verifyVoterCardStep,
  verifyFaceStep,
  verifyOTPStep,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login-step1', loginStep1);
router.post('/verify-card', verifyVoterCardStep);
router.post('/verify-face', verifyFaceStep);
router.post('/verify-otp', verifyOTPStep);
router.get('/me', protect, getMe);

module.exports = router;
