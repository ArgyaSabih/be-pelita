const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @desc    Protect routes - verify JWT token
// @access  Private
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Extract token from "Bearer TOKEN"
        token = req.headers.authorization.split(' ')[1];
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Format token tidak valid"
        });
      }
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (exclude password)
      const user = await User.findById(decoded.user.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token tidak valid. User tidak ditemukan"
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau sudah expired"
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

// @desc    Authorize specific roles
// @access  Private
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. User tidak terautentikasi"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} tidak memiliki akses ke resource ini`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
