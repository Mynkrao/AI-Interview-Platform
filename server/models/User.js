// models/User.js
// Mongoose schema for the `users` collection.
// Fields per SRS Section 9.1. Index per SRS Section 9.3 (Table 10):
//   users.email -> unique index (prevents duplicate accounts, fast login lookup).
// Pre-save bcrypt hook is intentionally implemented HERE, not in
// authController.js — SAD Section 12.1 file responsibility matrix assigns
// "Includes pre-save bcrypt hook" to models/User.js explicitly.
//
// OUT OF SCOPE FOR THIS FILE (deliberately):
// - Minimum 8-character password validation (SRS FR-01-02). By the time
//   Mongoose validates this field, `password` is already a bcrypt hash of
//   arbitrary length, so plain-text length checks belong in the Auth
//   module's input validator (validators/authValidator.js), not here.
// - A comparePassword() instance method. SAD's file responsibility matrix
//   (Section 12.1) states authController.js "Calls bcrypt, jwt, User
//   model" directly — bcrypt.compare() is called from the controller in
//   the Auth module, not wrapped as a model method.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // SRS Table 10: users.email -> Unique index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // Stored as a bcrypt hash (SRS Section 9.1 / SAD Section 9.1,
      // cost factor 10 — see pre-save hook below).
    },
    targetRole: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true } // adds createdAt, updatedAt (SRS Section 9.1)
);

// Hash the password with bcrypt (cost factor 10 per SRS NFR Security)
// whenever it is set or changed. Skips re-hashing on saves that don't
// touch the password field (e.g. profile updates to targetRole/skills).
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Never leak the password hash through res.json(user) / JSON.stringify.
// This is a safety net, not a substitute for controllers explicitly
// selecting only the fields they intend to return.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
