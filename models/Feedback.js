const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    parent: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    content: {type: String, required: true},
    type: {type: String, enum: ["saran", "keluhan"], required: true}
  },
  {timestamps: true}
);

module.exports = mongoose.model("Feedback", feedbackSchema);
