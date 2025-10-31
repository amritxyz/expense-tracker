/* backend/server.js */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { create_table, insert_user, get_users, get_user_by_email } = require('./db/login_statements');
const { create_expense_table, insert_expense, get_expense, get_expense_by_categorie } = require('./db/expense_income');
const app = express();

/* INFO: Enable cors for all origins */
app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',  /* Allow requests from frontend */
  methods: ['GET', 'POST'],        /* Allow GET and POST methods */
  credentials: true                 /* Allow cookies (if necessary) */
}));

app.use(express.json());  // Parse JSON requests

// Create tables when the server starts
create_table();
create_expense_table();

// Function to generate JWT token
function generateToken(user) {
  const payload = { id: user.id, email: user.email };  // Include user ID and email in the token
  const secret = 'your_jwt_secret_key';
  const options = { expiresIn: '1m' };  // Token expiration time
  return jwt.sign(payload, secret, options);
}

// POST /register - Register a new user
app.post('/register', (req, res) => {
  const { user_name, email, password } = req.body;

  if (!user_name || !email || !password) {
    return res.status(400).json({ message: 'Full Name, Email and Password are required' });
  }

  try {
    insert_user(user_name, email, password);
    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// GET /users - Retrieve all users
app.get('/users', (req, res) => {
  try {
    const users = get_users();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// POST /login - User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  try {
    /* Find user by email from the database */
    const user = get_user_by_email(email);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    /* INFO: Compare plain-text passwords */
    if (user.password === password) {
      /* INFO: Generate a JWT token */
      const token = generateToken(user);
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(400).json({ message: 'Incorrect password' });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

/* INFO: Middleware to protect routes with JWT authentication */
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Get token from Authorization header

  if (!token) return res.status(403).json({ message: 'Access denied' });

  /* Verify the JWT token */
  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;  /* Store decoded user info in request object */
    next();
  });
};

/* POST /expense - Create an expense (Protected route) */
app.post('/expense', authenticateJWT, (req, res) => {
  const { categories, amount, date } = req.body;

  if (!categories || !amount || !date) {
    return res.status(400).json({ message: "Categories, Amount and Date are required" });
  }

  try {
    insert_expense(categories, amount, date);
    res.status(200).json({ message: 'Inserted expense successfully' });
  } catch (err) {
    console.error("Error during insertion of expenses", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});
