// controllers/authController.js
// Implements the 5 functions SAD Section 12.1 assigns to this file:
// register, login, getProfile, updateProfile, uploadResume.
// All auth responses return {success, data:{token, user}} (SAD Section 8.4).
// Calls bcrypt, jwt, and the User model directly - no extra service-layer
// abstraction is introduced here, matching SAD's file responsibility matrix
// ("Calls bcrypt, jwt, User model").

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const env = require('../config/env');
const { sendSuccess, apiError } = require('../utils/apiResponse');

const JWT_EXPIRY = '7d'; // SAD Section 9.1

function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// POST /api/auth/register (SAD Section 6.1 / FR-01-01)
async function register(req, res, next) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(apiError('Email is already registered', 409)); // SAD Section 6.1: 409 Conflict
  }

  let user;
  try {
    // Password is hashed by User.js's pre-save hook, not here.
    user = await User.create({ name, email, password });
  } catch (err) {
    // Defensive fallback for the race condition where two registrations
    // for the same email land between the findOne check above and this
    // create() call. Mongoose surfaces the unique-index violation as a
    // duplicate-key error (code 11000); translate it to the same 409
    // the SAD flow documents, rather than letting it fall through as a 500.
    if (err.code === 11000) {
      return next(apiError('Email is already registered', 409));
    }
    return next(err);
  }

  const token = signToken(user._id);
  return sendSuccess(res, 201, { token, user });
}

// POST /api/auth/login (SAD Section 6.2 / FR-01-03)
async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(apiError('Invalid email or password', 401)); // SAD: "if not found -> 401"
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(apiError('Invalid email or password', 401)); // SAD: "if mismatch -> 401"
  }

  const token = signToken(user._id);
  return sendSuccess(res, 200, { token, user });
}

// GET /api/auth/profile (SAD Section 8.1 / FR-01-05)
async function getProfile(req, res, next) {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(apiError('User not found', 404));
  }
  return sendSuccess(res, 200, { user });
}

// PUT /api/auth/profile (SAD Section 8.1 / FR-01-05)
// Body: {name, targetRole, skills} - email and password are never editable
// through this endpoint (no such fields in the SAD request body contract).
async function updateProfile(req, res, next) {
  const { name, targetRole, skills } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return next(apiError('User not found', 404));
  }

  if (name !== undefined) user.name = name;
  if (targetRole !== undefined) user.targetRole = targetRole;
  if (skills !== undefined) user.skills = skills;

  await user.save();
  return sendSuccess(res, 200, { user });
}

// POST /api/auth/upload-resume (SAD Section 8.1 / FR-01-06)
// Expects `upload.single('resume')` (Multer) to have already run in the route.
async function uploadResume(req, res, next) {
  if (!req.file) {
    return next(apiError('No resume file uploaded', 400));
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return next(apiError('User not found', 404));
  }

  user.resumeUrl = `/uploads/${req.file.filename}`;
  await user.save();

  return sendSuccess(res, 200, { resumeUrl: user.resumeUrl });
}

module.exports = { register, login, getProfile, updateProfile, uploadResume };
