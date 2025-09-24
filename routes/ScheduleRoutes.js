const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule
} = require("../controllers/ScheduleController");

// POST new schedule
router.post("/", createSchedule);

// GET all schedules
router.get("/", getAllSchedules);

// PUT update schedule by id
router.put("/:id", updateSchedule);

// DELETE schedule by id
router.delete("/:id", deleteSchedule);

module.exports = router;
