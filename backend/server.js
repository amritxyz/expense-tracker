// backend/server.js
const express = require('express');
const cors = require('cors');
const { create_table, insert_user, get_users, get_user_by_email } = require('./db/login_statements');
const app = express();

// INFO: Enable cors for all origins
app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from your frontend
  methods: ['GET', 'POST'],        // Allow GET and POST methods
  credentials: true                 // Allow cookies if necessary
}));

app.use(express.json());

// Create the table when the server starts
create_table();

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

// GET /users - Get all users
app.get('/users', (req, res) => {
  try {
    const users = get_users();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// GET /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  try {
    // Find user from database using the function defined in login_statements.js
    const user = get_user_by_email(email);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare passwords (plaintext comparison here for simplicity)
    if (user.password === password) {
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(400).json({ message: 'Incorrect password' });
    }
  } catch (err) {
    console.error("Error during login:", err);  // Log the error
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});


// Start the server
app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});
