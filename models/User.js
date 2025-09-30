const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {
      type: String, 
      required: true, 
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: function() {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false 
    },
    googleId: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    role: {type: String, enum: ["ortu", "admin"], default: "ortu"},
    children: [{type: mongoose.Schema.Types.ObjectId, ref: "Child"}]
  },
  {timestamps: true}
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get user without password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
