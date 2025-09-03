// models/PermissionLetter.js
const mongoose = require("mongoose");

const permissionLetterSchema = new mongoose.Schema(
  {
    parent: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    reason: {type: String, required: true},
    date: {type: Date, required: true}
  },
  {timestamps: true}
);

module.exports = mongoose.model("PermissionLetter", permissionLetterSchema);
