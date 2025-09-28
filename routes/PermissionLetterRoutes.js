const express = require("express");
const router = express.Router();
const {
  createPermissionLetter,
  getParentPermissionLetters,
  getAllPermissionLetters,
  getPermissionLetterById,
  updatePermissionLetterStatus,
  updatePermissionLetter,
  deletePermissionLetter
} = require("../controllers/PermissionLetterController");
const { authenticate, authorize } = require("../middlewares/Auth");

// Create permission letter (Parent)
router.post("/", authenticate, authorize("ortu"), createPermissionLetter);

// Get all permission letters (Admin)
router.get("/all", authenticate, authorize("admin"), getAllPermissionLetters);

// Get parent permission letters
router.get("/", authenticate, authorize("ortu"), getParentPermissionLetters);

// Get permission letter by ID
router.get("/:id", authenticate, getPermissionLetterById);

// Update status (Admin)
router.put("/:id/status", authenticate, authorize("admin"), updatePermissionLetterStatus);

// Update permission letter (Parent)
router.put("/:id", authenticate, authorize("ortu"), updatePermissionLetter);

// Delete permission letter
router.delete("/:id", authenticate, deletePermissionLetter);

module.exports = router;