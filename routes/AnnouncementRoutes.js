const express = require("express");
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/AnnouncementController");

// SEMUA PUBLIC DULU (TANPA AUTH) 
// GET /api/announcements - Ambil semua announcement
router.get("/", getAllAnnouncements);

// GET /api/announcements/:id - Ambil announcement berdasarkan ID
router.get("/:id", getAnnouncementById);

// POST /api/announcements - Buat announcement baru
router.post("/", createAnnouncement);

// PUT /api/announcements/:id - Update announcement
router.put("/:id", updateAnnouncement);

// DELETE /api/announcements/:id - Hapus announcement
router.delete("/:id", deleteAnnouncement);

module.exports = router;