const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    day: {type: String, required: true},
    date: {type: String, required: true},
    activity: [
      {
        time: {type: String, required: true},
        subject: {type: String, required: true},
        teacher: {type: String, required: true}
      }
    ]
  },
  {timestamps: true}
);

module.exports = mongoose.model("Schedule", scheduleSchema);
