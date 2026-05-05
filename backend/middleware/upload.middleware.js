/* middleware/upload.middleware.js
 * Responsibility: Configure multer for in-memory file uploads (avatars).
 */

const multer = require("multer");
const { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } = require("../constant.js");

const upload = multer({
  storage: multer.memoryStorage(), /* Store in RAM, then write to DB */
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${ALLOWED_MIME_TYPES.join(", ")} files are allowed.`));
    }
  },
});

module.exports = upload;
