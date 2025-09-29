const express = require("express");
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

const router = express.Router();

router.post("/", authenticate, authorize("ortu"), createPermissionLetter);
router.get("/", authenticate, authorize("ortu"), getParentPermissionLetters);
router.get("/all", authenticate, authorize("admin"), getAllPermissionLetters);
router.get("/:id", authenticate, getPermissionLetterById);
router.put("/:id/status", authenticate, authorize("admin"), updatePermissionLetterStatus);
router.put("/:id", authenticate, authorize("ortu"), updatePermissionLetter);
router.delete("/:id", authenticate, deletePermissionLetter);

module.exports = router;
