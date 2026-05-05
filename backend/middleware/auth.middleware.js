const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constant.js");

function authenticate(req, res, next) {
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1]; /* Bearer <token> */

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; /* { id, email, iat, exp } */
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = authenticate;
