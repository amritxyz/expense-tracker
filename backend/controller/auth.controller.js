const validator = require("validator");
const { get_user_by_email, insert_user } = require("../model/user.model");
const { generate_token } = require("../utils/jwt.util.js");
const { MIN_PASSWORD_LENGTH } = require("../constant.js");

/**
 * POST /auth/register
 */
async function register(req, res, next) {
  try {
    const { user_name, email, password } = req.body;

    if (!user_name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const existing = await get_user_by_email(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // TODO: hash password before storing — e.g. bcrypt.hash(password, 10)
    const user = await insert_user(user_name, email, password);
    return res.status(201).json({ message: "Registered successfully.", user_id: user.id });

  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await get_user_by_email(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // TODO: replace with bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generate_token({ id: user.id, email: user.email });
    return res.status(200).json({ message: "Login successful.", token });

  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
