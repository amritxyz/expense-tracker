/* utils/validate.util.js
 * Responsibility: Reusable input validation helpers.
 */

const validator = require("validator");

function is_valid_email(email) {
  return typeof email === "string" && validator.isEmail(email);
}

function is_non_empty_string(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function is_positive_number(value) {
  const n = Number(value);
  return !isNaN(n) && n > 0;
}

module.exports = { is_valid_email, is_non_empty_string, is_positive_number };
