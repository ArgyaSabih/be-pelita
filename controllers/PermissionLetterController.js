const PermissionLetter = require("../models/PermissionLetter");

const createPermissionLetter = async (req, res) => {
  try {
    const { studentName, reason, startDate, endDate, supportingDocument } = req.body;

    if (!studentName || !reason || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Nama siswa, alasan, tanggal mulai, dan tanggal selesai wajib diisi"
      });
    }

    const permissionLetter = new PermissionLetter({
      parent: req.user._id,
      studentName: studentName.trim(),
      reason: reason.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      supportingDocument: supportingDocument || null
    });

    await permissionLetter.save();

    res.status(201).json({
      success: true,
      message: "Surat izin berhasil dibuat",
      data: permissionLetter
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const getParentPermissionLetters = async (req, res) => {
  try {
    const permissionLetters = await PermissionLetter.find({ parent: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil diambil",
      count: permissionLetters.length,
      data: permissionLetters
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const getAllPermissionLetters = async (req, res) => {
  try {
    const permissionLetters = await PermissionLetter.find()
      .populate("parent", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Semua surat izin berhasil diambil",
      count: permissionLetters.length,
      data: permissionLetters
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const getPermissionLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let permissionLetter;
    
    if (req.user.role === 'admin') {
      permissionLetter = await PermissionLetter.findById(id)
        .populate("parent", "name email");
    } else {
      permissionLetter = await PermissionLetter.findOne({ 
        _id: id, 
        parent: req.user._id 
      });
    }

    if (!permissionLetter) {
      return res.status(404).json({
        success: false,
        message: "Surat izin tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil diambil",
      data: permissionLetter
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const updatePermissionLetterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status harus berupa 'pending', 'approved', atau 'rejected'"
      });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes.trim();

    const permissionLetter = await PermissionLetter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("parent", "name email");

    if (!permissionLetter) {
      return res.status(404).json({
        success: false,
        message: "Surat izin tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: `Status surat izin berhasil diubah menjadi ${status}`,
      data: permissionLetter
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const updatePermissionLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, reason, startDate, endDate, supportingDocument } = req.body;

    const existingLetter = await PermissionLetter.findOne({ 
      _id: id, 
      parent: req.user._id 
    });

    if (!existingLetter) {
      return res.status(404).json({
        success: false,
        message: "Surat izin tidak ditemukan"
      });
    }

    if (existingLetter.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Hanya surat izin dengan status 'pending' yang dapat diubah"
      });
    }

    const updateFields = {};
    if (studentName) updateFields.studentName = studentName.trim();
    if (reason) updateFields.reason = reason.trim();
    if (startDate) updateFields.startDate = new Date(startDate);
    if (endDate) updateFields.endDate = new Date(endDate);
    if (supportingDocument !== undefined) updateFields.supportingDocument = supportingDocument;

    const permissionLetter = await PermissionLetter.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil diupdate",
      data: permissionLetter
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

const deletePermissionLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = req.user.role === 'admin' 
      ? { _id: id } 
      : { _id: id, parent: req.user._id };

    const permissionLetter = await PermissionLetter.findOneAndDelete(filter);

    if (!permissionLetter) {
      return res.status(404).json({
        success: false,
        message: "Surat izin tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Surat izin berhasil dihapus",
      data: permissionLetter
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
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
