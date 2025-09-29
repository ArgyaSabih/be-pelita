const express = require("express");
const {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/FeedbackController");
const { authenticate, authorize } = require("../middlewares/Auth");

const router = express.Router();

// Semua route butuh login
router.get("/", authenticate, getAllFeedbacks); // admin only
router.get("/:id", authenticate, getFeedbackById); // semua login
router.post("/", authenticate, createFeedback); // ortu/admin
router.put("/:id", authenticate, updateFeedback); // owner/admin
router.delete("/:id", authenticate, deleteFeedback); // owner/admin

module.exports = router;
