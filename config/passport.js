const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // Skip Google OAuth if credentials not provided
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials not found. Google login will be disabled.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          
          // Check existing googleID
          let existingUser = await User.findOne({ googleId: profile.id });
          
          if (existingUser) {
            return done(null, existingUser);
          }
          
          // Check registered email
          existingUser = await User.findOne({ email: email });
          
          if (existingUser) {
            // Update user with googleID
            existingUser.googleId = profile.id;
            await existingUser.save();
            return done(null, existingUser);
          }
          
          // New user, proceed to registration
          return done(null, profile); 

        } catch (err) {
          console.error('Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );

};