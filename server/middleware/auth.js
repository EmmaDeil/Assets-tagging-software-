const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Also check cookies for token (optional, for browser sessions)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route. Please login.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Find user by id from token and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (req.user.status === 'Inactive') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route. Token invalid or expired.' 
    });
  }
};

/**
 * Authorize specific roles
 * Usage: authorize('Administrator', 'Manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};

/**
 * Check specific permission
 * Usage: checkPermission('createAssets')
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Administrators have all permissions
    if (req.user.role === 'Administrator') {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({ 
        success: false,
        message: `You do not have permission to ${permission}` 
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  checkPermission,
};
