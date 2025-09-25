const mongoose = require("mongoose");
const User = require("../models/User");
const Child = require("../models/Child");
const { generateAuthToken } = require("../utils/JWT");

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { name, email, password, phoneNumber, address, childCode } = req.body;

    if (!childCode) {
      return res.status(400).json({ success: false, message: "Kode belum dimasukkan" });
    }
    const child = await Child.findOne({ invitationCode: childCode }).session(session);

    if (!child) {
        return res.status(400).json({ success: false, message: "Kode anak tidak valid" });
    }

    const user = new User({ name, email, password, phoneNumber, address });
    
    user.children.push(child._id); 
    child.parents.push(user._id);

    await user.save({ session });
    await child.save({ session });

    await session.commitTransaction();

    const token = generateAuthToken(user._id);
    
    const userResponse = user.toJSON();
    userResponse.children = [child.toJSON()];
    
    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan dan terhubung dengan anak",
      data: { 
        user: userResponse, 
        token 
      }
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar"
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password harus diisi"
      });
    }

    // Find user and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    // Generate JWT token
    const token = generateAuthToken(user._id);

    // Send response
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        user: user.toJSON(), // This will exclude password
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Use the user data that's already loaded from auth middleware
    let user = req.user;

    // Only populate children if needed and not already populated
    if (user.children && user.children.length > 0 && typeof user.children[0] === 'string') {
      user = await user.populate('children');
    }

    res.status(200).json({
      success: true,
      message: "Profile berhasil diambil",
      data: {
        user
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.user._id; // Use _id instead of id for consistency

    // Build update object (only include provided fields)
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diupdate"
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      {
        new: true, // Return updated document
        runValidators: true // Run schema validations
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile berhasil diupdate",
      data: {
        user
      }
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};