const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule
} = require("../controllers/ScheduleController");
const {authenticate} = require("../middlewares/Auth");

// POST new schedule
router.post("/", authenticate, createSchedule);

// GET all schedules
router.get("/", getAllSchedules);

// PUT update schedule by id
router.put("/:id", authenticate, updateSchedule);

// DELETE schedule by id
router.delete("/:id", authenticate, deleteSchedule);

module.exports = router;
