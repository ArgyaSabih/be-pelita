const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    content: {type: String, required: true},
    dateSent: {type: Date, default: Date.now},
    sentBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
  },
  {timestamps: true}
);

module.exports = mongoose.model("Announcement", announcementSchema);
