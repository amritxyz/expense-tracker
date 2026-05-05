/* middleware/error.middleware.js
 * Responsibility: Catch all unhandled errors passed via next(err).
 * Must be the LAST middleware registered in index.js.
 */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  /* Don't expose internal error details in production */
  const is_dev = process.env.NODE_ENV !== "production";

  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(is_dev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
