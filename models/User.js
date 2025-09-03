const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    role: {type: String, enum: ["ortu", "admin"], default: "ortu"},
    googleId: {type: String}, // untuk auth google
    children: [{type: mongoose.Schema.Types.ObjectId, ref: "Child"}]
  },
  {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);
