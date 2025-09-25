require("dotenv").config();
const jwt = require("jsonwebtoken");

/**
 * @param {string} userId
 * @returns {string}
 */

exports.generateAuthToken = (userId) => {
  const payload = {
    user: {
      id: userId,
    },
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return token;
};