const mongoose = require("mongoose");

const permissionLetterSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String, 
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    supportingDocument: {
      type: String,
      default: null
    },
    adminNotes: {
      type: String,
      default: null
    }
  },
  {timestamps: true}
);

permissionLetterSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('Tanggal mulai tidak boleh setelah tanggal selesai'));
  } else {
    next();
  }
});

// Transform _id to id in JSON output
permissionLetterSchema.method("toJSON", function(){
  const {__v, _id, ...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("PermissionLetter", permissionLetterSchema);
