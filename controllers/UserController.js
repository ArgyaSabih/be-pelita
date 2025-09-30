const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Child = require("../models/Child");
const { generateTempToken, generateAuthToken } = require('../utils/JWT');

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password harus diisi"
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    const token = generateAuthToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        user: user.toJSON(),
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

// Controller untuk /google/callback
const googleCallback = async (req, res) => {
  const userOrProfile = req.user;

  // Check existing profile
  if (userOrProfile._id) {
    // Existing user: log in directly
    const token = generateAuthToken(userOrProfile._id);
    return res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  } else {
    // New user: create temporary token and redirect to data completion page
    const tempToken = generateTempToken(userOrProfile);
    return res.redirect(`http://localhost:3000/register/complete?token=${tempToken}`);
  }
};

// Controller untuk /google/registration
const googleRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tempToken, childCode } = req.body;

    if (!tempToken || !childCode) {
      return res.status(400).json({ message: 'Token sementara dan kode anak wajib diisi' });
    }

    const googleProfile = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    const child = await Child.findOne({ invitationCode: childCode }).session(session);
    if (!child) {
      return res.status(400).json({ success: false, message: "Kode anak tidak valid" });
    }

    const newUser = new User({
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
    });
    
    newUser.children.push(child._id);
    child.parents.push(newUser._id);
    
    await newUser.save({ session });
    await child.save({ session });

    await session.commitTransaction();

    // Create actual authentication token
    const finalToken = generateAuthToken(newUser._id);
    res.status(201).json({
      success: true,
      message: 'Registrasi Google berhasil diselesaikan',
      data: { user: newUser.toJSON(), token: finalToken },
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token sementara tidak valid atau kedaluwarsa' 
      });
    }
    
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
    
    console.error('Google registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let user = req.user;

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
    const userId = req.user._id;

    // Build update object (only include provided fields)
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diupdate"
      });
    }

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
  googleCallback,
  googleRegistration,
  getProfile,
  updateProfile
};