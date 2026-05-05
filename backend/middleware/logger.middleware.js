/* middleware/logger.middleware.js
 * Responsibility: Log incoming requests with method, path, and response time.
 */

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${ms}ms`);
  });

  next();
}

module.exports = requestLogger;
