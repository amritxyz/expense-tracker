/* utils/jwt.util.js
 * Responsibility: Generate and verify JWT tokens.
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../constant.js");

/**
 * Generate a signed JWT for a user payload.
 * @param {object} payload - e.g. { id, email }
 * @returns {string} signed token
 */
function generate_token(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws if token is invalid or expired
 */
function verify_token(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generate_token, verify_token };
