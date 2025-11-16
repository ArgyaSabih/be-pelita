const express = require("express");
const router = express.Router();
const {
  createChild,
  getAllChildren,
  getChildById,
  updateChild,
  deleteChild,
  updateChildProfile
} = require("../controllers/ChildController");
const {authenticate} = require("../middlewares/Auth");

// POST new child
router.post("/", authenticate, createChild);

// GET all children
router.get("/", getAllChildren);

// GET child by id
router.get("/:id", getChildById);

// PUT update child by id
router.put("/:id", authenticate, updateChild);

// DELETE child by id
router.delete("/:id", authenticate, deleteChild);

// PUT by id for parents
router.put("/:id", authenticate, updateChildProfile);

module.exports = router;

