const Schedule = require("../models/Schedule");

// POST new schedule
const createSchedule = async (req, res) => {
  try {
    const {day, date, activity} = req.body;

    if (!day) {
      return res.status(400).json({message: "Field 'day' is required."});
    }

    const dayMap = {
      senin: "Senin",
      selasa: "Selasa",
      rabu: "Rabu",
      kamis: "Kamis",
      jumat: "Jumat",
      sabtu: "Sabtu",
      minggu: "Minggu"
    };

    const dayKey = String(day).trim().toLowerCase();
    const canonicalDay = dayMap[dayKey];
    if (!canonicalDay) {
      return res
        .status(400)
        .json({message: `Field 'day' must be one of: ${Object.values(dayMap).join(", ")}.`});
    }

    if (!date) {
      return res.status(400).json({message: "Field 'date' is required."});
    }

    const dateObj = String(date).trim();

    if (!Array.isArray(activity) || activity.length === 0) {
      return res.status(400).json({message: "Field 'activity' must be a non-empty array."});
    }

    const errors = [];
    activity.forEach((item, idx) => {
      const time = item && item.time ? String(item.time).trim() : "";
      const subject = item && item.subject ? String(item.subject).trim() : "";
      const teacher = item && item.teacher ? String(item.teacher).trim() : "";

      if (!time) {
        errors.push({
          index: idx,
          field: "time",
          message: `Field 'time' is required for activity at index ${idx}.`
        });
      }
      if (!subject) {
        errors.push({
          index: idx,
          field: "subject",
          message: `Field 'subject' is required for activity at index ${idx}.`
        });
      }
      if (!teacher) {
        errors.push({
          index: idx,
          field: "teacher",
          message: `Field 'teacher' is required for activity at index ${idx}.`
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({message: "Validation error in activity items.", errors});
    }

    const normalizedActivity = activity.map((a) => ({
      time: String(a.time).trim(),
      subject: String(a.subject).trim(),
      teacher: String(a.teacher).trim()
    }));

    const schedule = new Schedule({day: canonicalDay, date: dateObj, activity: normalizedActivity});
    await schedule.save();

    return res.status(201).json({message: "Schedule created.", data: schedule});
  } catch (error) {
    console.error("createSchedule error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// GET all schedules
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({createdAt: -1});
    return res.status(200).json({data: schedules});
  } catch (error) {
    console.error("getAllSchedules error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// UPDATE schedule by id
const updateSchedule = async (req, res) => {
  try {
    const {id} = req.params;
    const {day, date, activity} = req.body;

    const update = {};

    if (day !== undefined) {
      const dayMap = {
        senin: "Senin",
        selasa: "Selasa",
        rabu: "Rabu",
        kamis: "Kamis",
        jumat: "Jumat",
        sabtu: "Sabtu",
        minggu: "Minggu"
      };
      const dayKey = String(day).trim().toLowerCase();
      const canonicalDay = dayMap[dayKey];
      if (!canonicalDay) {
        return res
          .status(400)
          .json({message: `Field 'day' must be one of: ${Object.values(dayMap).join(", ")}.`});
      }
      update.day = canonicalDay;
    }

    if (date !== undefined) {
      const dateObj = String(date).trim();
      update.date = dateObj;
    }

    if (activity !== undefined) {
      if (!Array.isArray(activity) || activity.length === 0) {
        return res.status(400).json({message: "Field 'activity' must be a non-empty array."});
      }

      const errors = [];
      activity.forEach((item, idx) => {
        const time = item && item.time ? String(item.time).trim() : "";
        const subject = item && item.subject ? String(item.subject).trim() : "";
        const teacher = item && item.teacher ? String(item.teacher).trim() : "";

        if (!time) {
          errors.push({
            index: idx,
            field: "time",
            message: `Field 'time' is required for activity at index ${idx}.`
          });
        }
        if (!subject) {
          errors.push({
            index: idx,
            field: "subject",
            message: `Field 'subject' is required for activity at index ${idx}.`
          });
        }
        if (!teacher) {
          errors.push({
            index: idx,
            field: "teacher",
            message: `Field 'teacher' is required for activity at index ${idx}.`
          });
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({message: "Validation error in activity items.", errors});
      }

      update.activity = activity.map((a) => ({
        time: String(a.time).trim(),
        subject: String(a.subject).trim(),
        teacher: String(a.teacher).trim()
      }));
    }

    const updated = await Schedule.findByIdAndUpdate(id, update, {new: true});
    if (!updated) {
      return res.status(404).json({message: "Schedule not found."});
    }

    return res.status(200).json({message: "Schedule updated.", data: updated});
  } catch (error) {
    console.error("updateSchedule error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// DELETE schedule by id
const deleteSchedule = async (req, res) => {
  try {
    const {id} = req.params;
    const deleted = await Schedule.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({message: "Schedule not found."});
    }
    return res.status(200).json({message: "Schedule deleted.", data: deleted});
  } catch (error) {
    console.error("deleteSchedule error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule
};
