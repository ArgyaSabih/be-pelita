const mongoose = require("mongoose");

const permissionLetterSchema = new mongoose.Schema(
  {
    parent: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    studentName: {type: String, required: true, trim: true},
    reason: {type: String, required: true, trim: true},
    dateRange: {
      startDate: {type: Date, required: true},
      endDate: {type: Date, required: true}
    },
    softcopyFile: {
      filename: {type: String},
      originalName: {type: String},
      mimetype: {type: String},
      size: {type: Number},
      path: {type: String}
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {timestamps: true}
);

// Date validation
permissionLetterSchema.pre('validate', function(next) {
  if (this.dateRange.startDate && this.dateRange.endDate) {
    if (this.dateRange.startDate > this.dateRange.endDate) {
      return next(new Error('Tanggal mulai tidak boleh lebih dari tanggal selesai'));
    }
  }
  next();
});

module.exports = mongoose.model("PermissionLetter", permissionLetterSchema);
