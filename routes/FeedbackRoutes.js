const express = require("express");
const {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByParent,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/FeedbackController");
const { authenticate } = require("../middlewares/Auth");

const router = express.Router();

// Semua route butuh login
router.get("/", authenticate, getAllFeedbacks); // admin only
router.get("/user/:parentId", authenticate, getFeedbacksByParent); //ortu pemilik feedback
router.get("/:id", authenticate, getFeedbackById); // semua login
router.post("/", authenticate, createFeedback); // ortu/admin
router.put("/:id", authenticate, updateFeedback); // ortu pemilik feedback/admin
router.delete("/:id", authenticate, deleteFeedback); // ortu pemilik feedback/admin

module.exports = router;
