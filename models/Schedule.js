const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    day: {type: String, enum: ["Senin", "Selasa", "Rabu"], required: true},
    activity: [
      {
        time: String,
        subject: String,
        teacher: String
      }
    ]
  },
  {timestamps: true}
);

module.exports = mongoose.model("Schedule", scheduleSchema);
