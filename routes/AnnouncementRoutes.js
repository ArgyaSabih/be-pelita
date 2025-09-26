const express = require("express");
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/AnnouncementController");

// import middleware auth
const {authenticate, authorize} = require("../middlewares/Auth")

// PUBLIC ROUTES
// GET /api/announcements - Ambil semua announcement
router.get("/", authenticate, authorize("admin", "ortu"), getAllAnnouncements);

// GET /api/announcements/:id - Ambil announcement berdasarkan ID
router.get("/:id", authenticate, authorize("admin", "ortu"), getAnnouncementById);

// PROTECTED ROUTES 
// POST /api/announcements - Buat announcement baru
router.post("/", authenticate, authorize("admin"), createAnnouncement);

// PUT /api/announcements/:id - Update announcement
router.put("/:id", authenticate, authorize("admin"), updateAnnouncement);

// DELETE /api/announcements/:id - Hapus announcement
router.delete("/:id", authenticate, authorize("admin"), deleteAnnouncement);

module.exports = router;