// routes/authRoutes.js
// Mounts at /api/auth (app.js). Matches SAD Section 8.1 exactly:
//   POST   /register       Public
//   POST   /login          Public
//   GET    /profile        Bearer JWT
//   PUT    /profile        Bearer JWT
//   POST   /upload-resume  Bearer JWT (multipart/form-data)
//
// Multer is configured here, co-located with its only consumer
// (upload-resume), rather than in app.js. SAD's Section 12.1 file matrix
// lists "Multer" as part of app.js's responsibilities, but that reads as
// a summary of the app's overall middleware stack, not a literal
// requirement that the multer() instance itself live in app.js - Multer
// is inherently route-specific (single file field, single endpoint), and
// SRS/SAD name no other upload endpoint that would need to share this
// config.

const path = require('path');
const multer = require('multer');
const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules, updateProfileRules } = require('../validators/authValidator');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// --- Multer config for resume upload (SRS FR-01-06 / SAD Section 8.1) ---
// SRS/SAD specify "PDF" and "backend file system" storage but do not
// specify a max file size. 5 MB is an engineering default to protect the
// Render/Railway free-tier disk (see README's known infrastructure risk
// note from Module 1) - not a documented requirement, flagging it as such.
const RESUME_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, not SRS/SAD-specified

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RESUME_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${req.userId}-${Date.now()}${ext}`);
  },
});

function pdfOnlyFilter(_req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed for resume upload'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: MAX_RESUME_SIZE_BYTES },
});

// --- Routes ---
router.post('/register', registerRules, validateRequest, asyncHandler(authController.register));
router.post('/login', loginRules, validateRequest, asyncHandler(authController.login));
router.get('/profile', protect, asyncHandler(authController.getProfile));
router.put('/profile', protect, updateProfileRules, validateRequest, asyncHandler(authController.updateProfile));
router.post('/upload-resume', protect, upload.single('resume'), asyncHandler(authController.uploadResume));

module.exports = router;
