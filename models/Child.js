const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama anak wajib diisi'],
      trim: true
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Tanggal lahir anak wajib diisi']
    },

    class: {
      type: String,
      enum: [ 'Kelas A', 'Kelas B'],
      required: [true, 'Kelas anak wajib diisi']
    },

    parents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    // Kode unik untuk orang tua menghubungkan akun dengan anak
    invitationCode: {
      type: String,
      required: true,
      unique: true,
    },

    medicalRecord: [{
      type: String
    }],

    notes: {
      type: String
    }
  }, 
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("Child", childSchema);