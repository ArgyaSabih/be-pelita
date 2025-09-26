const Feedback = require("../models/Feedback");

// GET ALL Feedbacks (admin only)
const getAllFeedbacks = async (req, res) => {
  try {
    // Kalau user bukan admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Hanya admin yang bisa melihat semua feedback"
      });
    }

    const feedbacks = await Feedback.find()
      .populate("parent", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Feedbacks retrieved successfully",
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving feedbacks",
      error: error.message,
    });
  }
};

// GET Feedback by ID (semua login user bisa lihat)
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id).populate("parent", "name email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving feedback",
      error: error.message,
    });
  }
};

// CREATE Feedback (ortu/admin login)
const createFeedback = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({
        success: false,
        message: "Content and type are required",
      });
    }

    if (!["saran", "keluhan"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'saran' or 'keluhan'",
      });
    }

    const newFeedback = new Feedback({
      parent: req.user._id, // ambil user login
      content,
      type,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: newFeedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating feedback",
      error: error.message,
    });
  }
};

// UPDATE Feedback (hanya pemilik atau admin)
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    const filter = req.user.role === "admin"
      ? { _id: id }
      : { _id: id, parent: req.user._id };

    const updatedFeedback = await Feedback.findOneAndUpdate(
      filter,
      { content, type },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating feedback",
      error: error.message,
    });
  }
};

// DELETE Feedback (hanya pemilik atau admin)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = req.user.role === "admin"
      ? { _id: id }
      : { _id: id, parent: req.user._id };

    const deletedFeedback = await Feedback.findOneAndDelete(filter);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      data: deletedFeedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting feedback",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
