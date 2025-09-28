const PermissionLetter = require("../models/PermissionLetter");

// Helper function for validation
const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `Kolom ${fieldName} harus diisi`;
  }
  return null;
};

// Helper function for error response
const sendError = (res, status, message, error = null) => {
  const response = { success: false, message };
  if (error) {
    response.error = error.message;
  }
  return res.status(status).json(response);
};

// Create permission letter
const createPermissionLetter = async (req, res) => {
  try {
    const { studentName, reason, startDate, endDate } = req.body;

    // Validation
    const nameError = validateRequired(studentName, "nama siswa");
    if (nameError) return sendError(res, 400, nameError);
    
    const reasonError = validateRequired(reason, "alasan");
    if (reasonError) return sendError(res, 400, reasonError);
    
    const startDateError = validateRequired(startDate, "tanggal mulai");
    if (startDateError) return sendError(res, 400, startDateError);
    
    const endDateError = validateRequired(endDate, "tanggal selesai");
    if (endDateError) return sendError(res, 400, endDateError);

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendError(res, 400, "Format tanggal tidak valid");
    }

    if (start > end) {
      return sendError(res, 400, "Tanggal mulai tidak boleh lebih dari tanggal selesai");
    }

    // Create
    const permissionLetter = new PermissionLetter({
      parent: req.user._id,
      studentName,
      reason,
      dateRange: { startDate: start, endDate: end },
      softcopyFile: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : undefined
    });

    await permissionLetter.save();

    res.status(201).json({
      success: true,
      message: "Surat izin berhasil dibuat",
      data: permissionLetter
    });

  } catch (error) {
    console.error('Create permission letter error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors
      });
    }

    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Get parent permission letters
const getParentPermissionLetters = async (req, res) => {
  try {
    const permissionLetters = await PermissionLetter.find({ parent: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daftar surat izin berhasil diambil",
      count: permissionLetters.length,
      data: permissionLetters
    });

  } catch (error) {
    console.error('Get parent permission letters error:', error);
    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Get all permission letters (Admin)
const getAllPermissionLetters = async (req, res) => {
  try {
    const permissionLetters = await PermissionLetter.find()
      .populate('parent', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Semua surat izin berhasil diambil",
      count: permissionLetters.length,
      data: permissionLetters
    });

  } catch (error) {
    console.error('Get all permission letters error:', error);
    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Get permission letter by ID
const getPermissionLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let permissionLetter;
    if (req.user.role === 'admin') {
      permissionLetter = await PermissionLetter.findById(id).populate('parent', 'name email phoneNumber');
    } else {
      permissionLetter = await PermissionLetter.findOne({ 
        _id: id, 
        parent: req.user._id 
      });
    }

    if (!permissionLetter) {
      return sendError(res, 404, "Surat izin tidak ditemukan");
    }

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil diambil",
      data: permissionLetter
    });

  } catch (error) {
    console.error('Get permission letter by ID error:', error);
    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Update status (Admin)
const updatePermissionLetterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return sendError(res, 400, "Status harus berupa pending, approved, atau rejected");
    }

    const permissionLetter = await PermissionLetter.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('parent', 'name email phoneNumber');

    if (!permissionLetter) {
      return sendError(res, 404, "Surat izin tidak ditemukan");
    }

    res.status(200).json({
      success: true,
      message: `Status surat izin berhasil diubah menjadi ${status}`,
      data: permissionLetter
    });

  } catch (error) {
    console.error('Update permission letter status error:', error);
    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Update permission letter (Parent)
const updatePermissionLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, reason, startDate, endDate } = req.body;

    // Check ownership
    const existingLetter = await PermissionLetter.findOne({ 
      _id: id, 
      parent: req.user._id 
    });

    if (!existingLetter) {
      return sendError(res, 404, "Surat izin tidak ditemukan");
    }

    // Check status
    if (existingLetter.status !== 'pending') {
      return sendError(res, 400, "Surat izin hanya dapat diubah jika statusnya pending");
    }

    // Build update
    const updateFields = {};
    if (studentName !== undefined) {
      const nameError = validateRequired(studentName, "nama siswa");
      if (nameError) return sendError(res, 400, nameError);
      updateFields.studentName = studentName;
    }
    if (reason !== undefined) {
      const reasonError = validateRequired(reason, "alasan");
      if (reasonError) return sendError(res, 400, reasonError);
      updateFields.reason = reason;
    }
    if (startDate !== undefined || endDate !== undefined) {
      const newStartDate = startDate ? new Date(startDate) : existingLetter.dateRange.startDate;
      const newEndDate = endDate ? new Date(endDate) : existingLetter.dateRange.endDate;
      
      // Validate new dates
      if (startDate && isNaN(newStartDate.getTime())) {
        return sendError(res, 400, "Format tanggal mulai tidak valid");
      }
      if (endDate && isNaN(newEndDate.getTime())) {
        return sendError(res, 400, "Format tanggal selesai tidak valid");
      }
      if (newStartDate > newEndDate) {
        return sendError(res, 400, "Tanggal mulai tidak boleh lebih dari tanggal selesai");
      }
      
      updateFields.dateRange = {
        startDate: newStartDate,
        endDate: newEndDate
      };
    }

    // Handle file update
    if (req.file) {
      updateFields.softcopyFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    const updatedLetter = await PermissionLetter.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil diupdate",
      data: updatedLetter
    });

  } catch (error) {
    console.error('Update permission letter error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors
      });
    }

    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

// Delete permission letter
const deletePermissionLetter = async (req, res) => {
  try {
    const { id } = req.params;
    
    let permissionLetter;
    if (req.user.role === 'admin') {
      permissionLetter = await PermissionLetter.findByIdAndDelete(id);
    } else {
      permissionLetter = await PermissionLetter.findOneAndDelete({ 
        _id: id, 
        parent: req.user._id 
      });
    }

    if (!permissionLetter) {
      return sendError(res, 404, "Surat izin tidak ditemukan");
    }

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil dihapus",
      data: permissionLetter
    });

  } catch (error) {
    console.error('Delete permission letter error:', error);
    return sendError(res, 500, "Terjadi kesalahan server", error);
  }
};

module.exports = {
  createPermissionLetter,
  getParentPermissionLetters,
  getAllPermissionLetters,
  getPermissionLetterById,
  updatePermissionLetterStatus,
  updatePermissionLetter,
  deletePermissionLetter
};