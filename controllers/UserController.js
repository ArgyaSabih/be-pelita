const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Child = require("../models/Child");
const { generateTempToken, generateAuthToken } = require('../utils/JWT');

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan Password wajib diisi"
      });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser && existingUser.name && existingUser.children.length > 0) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar. Silakan login." });
    }

    let user;
    if (existingUser) {
      existingUser.password = password;
      user = await existingUser.save();
    } else {
      user = new User({
        email,
        password,
      });
      await user.save();
    }

    const token = generateAuthToken(user._id);
    
    res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat. Silakan lengkapi profil Anda.",
      data: { 
        user: user.toJSON(),
        token 
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: "Data tidak valid", errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password harus diisi" });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    // Periksa apakah akun sudah dihubungkan ke data anak
    if (!user.name || !user.phoneNumber || !user.address || user.children.length === 0) {
      const token = generateAuthToken(user._id);
      return res.status(401).json({
        success: false,
        message: "Silakan lengkapi profil Anda terlebih dahulu.",
        code: "PROFILE_INCOMPLETE",
        data: { token }
      });
    }

    const token = generateAuthToken(user._id);
    const userWithChildren = await User.findById(user._id).populate('children');

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        user: userWithChildren.toJSON(),
        token
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// @desc    Register Step 2: Complete profile (Name, Phone, Address, Child)
// @route   PUT /api/users/complete-profile
// @access  Private (Needs auth token from step 1)
const completeProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, phoneNumber, address, childCode } = req.body;
    const userId = req.user._id;

    if (!name || !phoneNumber || !address || !childCode) {
      return res.status(400).json({ success: false, message: "Nama, No. HP, Alamat, dan Kode Anak wajib diisi" });
    }

    const child = await Child.findOne({ invitationCode: childCode }).session(session);
    if (!child) {
      return res.status(400).json({ success: false, message: "Kode anak tidak valid" });
    }

    const user = await User.findById(userId).session(session);
    if (user.children.includes(child._id)) {
      return res.status(400).json({ success: false, message: "Anak ini sudah terhubung dengan akun Anda." });
    }

    user.name = name;
    user.phoneNumber = phoneNumber;
    user.address = address;
    
    user.children.push(child._id); 
    child.parents.push(user._id);

    await user.save({ session });
    await child.save({ session });

    await session.commitTransaction();
    
    const updatedUser = await User.findById(userId).populate('children');

    res.status(200).json({
      success: true,
      message: "Profil berhasil dilengkapi dan anak berhasil dihubungkan.",
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Complete profile error:', error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  } finally {
    session.endSession();
  }
};

// @desc    Google login callback
// @route   GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  const userOrProfile = req.user;

  if (userOrProfile._id) {
    const user = userOrProfile;
    const token = generateAuthToken(user._id);
    
    // Cek apakah profil lengkap
    if (user.name && user.children && user.children.length > 0) {
      return res.redirect(`http://localhost:3000/?token=${token}`);
    } else {
      return res.redirect(`http://localhost:3000/register/complete?token=${token}`);
    }
  } else {
    const tempToken = generateTempToken(userOrProfile);
    return res.redirect(`http://localhost:3000/register/complete?tempToken=${tempToken}`);
  }
};

// @desc    Complete Google registration (Step 2/3)
// @route   POST /api/auth/google/registration
const googleRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tempToken, name, phoneNumber, address, childCode } = req.body;

    if (!tempToken || !name || !phoneNumber || !address || !childCode) {
      return res.status(400).json({ message: 'Semua data wajib diisi' });
    }

    const googleProfile = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    const child = await Child.findOne({ invitationCode: childCode }).session(session);
    if (!child) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Kode anak tidak valid" });
    }

    const newUser = new User({
      name: name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      phoneNumber: phoneNumber,
      address: address
    });
    
    newUser.children.push(child._id);
    child.parents.push(newUser._id);
    
    await newUser.save({ session });
    await child.save({ session });

    await session.commitTransaction();

    const finalToken = generateAuthToken(newUser._id);
    res.status(201).json({
      success: true,
      message: 'Registrasi Google berhasil diselesaikan',
      data: { user: newUser.toJSON(), token: finalToken },
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Token sementara tidak valid atau kedaluwarsa' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }
    console.error('Google registration error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
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
    const { name, phoneNumber, address } = req.body;
    const userId = req.user._id;

    // Build update object (only include provided fields)
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (address) updateFields.address = address;

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
  completeProfile,
  googleCallback,
  googleRegistration,
  getProfile,
  updateProfile
};