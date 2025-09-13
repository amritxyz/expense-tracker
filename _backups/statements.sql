-- This file exists, just for decision making and
-- doesn't effect any project's components or source code.

-- users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER
)

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')), -- enum-like constraint
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                    -- Optional: links to users table
  category_id INTEGER NOT NULL,       -- Links to categories.id
  amount REAL NOT NULL,               -- e.g., 1500.00
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT,
  date DATE NOT NULL DEFAULT (date('now')), -- Auto-set to today
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Expected entries:
-- This table defines rules for what should be entered regularly.
-- Like monthly electricity expense, rental expense, etc...
CREATE TABLE IF NOT EXISTS expected_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  category_id INTEGER NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  day_of_month INTEGER NULL,      -- e.g., 1 for "1st of month"
  day_of_week INTEGER NULL,       -- e.g., 5 for "every Friday"
  amount REAL NULL,               -- optional: expect exactly this amount?
  description TEXT,
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Alerts :
-- Where we store missing/unexpected events.
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('missing', 'unexpected', 'overspend')),
  message TEXT NOT NULL,
  category_id INTEGER NULL,
  transaction_id INTEGER NULL,
  expected_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT 0,

  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
