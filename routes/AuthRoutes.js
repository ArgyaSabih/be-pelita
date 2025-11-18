const express = require('express');
const passport = require('passport');
const { generateAuthToken } = require('../utils/JWT');
const { googleCallback, googleRegistration } = require('../controllers/UserController');

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleOAuthEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

if (isGoogleOAuthEnabled) {
  // @desc    Authenticate Google
  // @route   GET /api/auth/google
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // @desc    Google login callback
  // @route   GET /api/auth/google/callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login'}),
    googleCallback
  );

  router.post('/google/registration', googleRegistration);
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured.' 
    });
  });

  router.post('/google/registration', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured.' 
    });
  });
}

module.exports = router;