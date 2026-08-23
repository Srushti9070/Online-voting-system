const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Middleware
 * Verifies JWT token from Authorization header and populates req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_voting_system_jwt_key_2026_secure_key');

      req.user = await User.findById(decoded.id).select('-password').populate('location');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(`❌ JWT Auth Middleware Error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no Bearer token provided' });
  }
};

/**
 * Authorize Roles Middleware
 * Restricts access to specific user roles (e.g. 'admin').
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
