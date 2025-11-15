const express = require("express");
const {
  register,
  login,
  completeProfile,
  getProfile,
  updateProfile
} = require("../controllers/UserController");
const { authenticate, authorize } = require("../middlewares/Auth");

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   PUT /api/users/complete-profile
// @desc    Complete user profile
// @access  Private
router.put("/complete-profile", authenticate, completeProfile);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", authenticate, getProfile);


// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticate, updateProfile);

module.exports = router;
