require("dotenv").config();

module.exports = {
  /* Server */
  PORT: process.env.PORT || 5000,

  /* CORS */
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  /* JWT */
  JWT_SECRET:     process.env.JWT_SECRET  || "kjdalsq0eq0eqadsjlkasd9q9i120",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES || "24h",

  /* Database */
  DB_HOST:     process.env.DB_HOST     || "localhost",
  DB_PORT:     process.env.DB_PORT     || 5432,
  DB_NAME:     process.env.DB_NAME     || "expense_tracker",
  DB_USER:     process.env.DB_USER     || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",

  /* File Upload */
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES:  ["image/jpeg", "image/png", "image/webp"],

  /* Validation */
  MIN_PASSWORD_LENGTH: 6,
};
