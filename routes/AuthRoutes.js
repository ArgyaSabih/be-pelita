const express = require('express');
const passport = require('passport');
const { generateAuthToken } = require('../utils/JWT');
const { googleCallback, googleRegistration } = require('../controllers/UserController');

const router = express.Router();

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

module.exports = router;