// backend/db/income.js

const Database = require('better-sqlite3');
const path = require('path');

/*
 * INFO: Define the database path
 */
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath, { verbose: console.log });

/*
 * TODO: feature to add income or set budget and show report and warning accordingly
 */
const income_table = 'income';

const income_attributes = `
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  inc_source TEXT NOT NULL,
  categories TEXT DEFAULT 'income',
  amount INTEGER NOT NULL,
  date   DATETIME,
  FOREIGN KEY (user_id) REFERENCES login_users(id)
`;

/*
 * TODO: Function to crate income table or budget table.
 * NOTE: (useless) might be useful in the future.
 */
function create_income_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${income_table} (
      ${income_attributes}
    )
  `;
  try {
    db.prepare(sql).run();
    console.log(`[✓] Table ${income_table} created or already exists.`);
  } catch (err) {
    console.error(`[x] Failed to create table: `, err.message);
  }
}

/*
 * INFO: Function to insert a income
 */
function insert_income(user_id, inc_source, amount, date) {
  const sql = `
    INSERT INTO ${income_table} (user_id, inc_source, amount, date)
    VALUES (?, ?, ?, ?)
  `;
  try {
    const result = db.prepare(sql).run(user_id, inc_source, amount, date);
    console.log(`[✓] Inserted income with ID: ${result.lastInsertRowid}`);
  } catch (err) {
    console.error(`[x] Failed to insert income: `, err.message);
  }
}

function edit_income_by_id(user_id, id, inc_source, amount, date) {
  const categories = "income";
  const sql = `
    UPDATE ${income_table}
    SET inc_source = ?, categories = ?, amount = ?, date = ?
    WHERE user_id = ? AND id = ?`;
  try {
    const result = db.prepare(sql).run(inc_source, categories, amount, date, user_id, id);
    if (result.changes > 0) {
      console.log(`[✓] Updated income with ID: ${id}`);
      return { success: true, message: "Expense updated successfully." };
    } else {
      console.log(`[x] No income found with ID: ${id} for user ID: ${user_id}`);
      return { success: false, message: "Expense not found or not updated." };
    }
  } catch (err) {
    console.error(`[x] Failed to update income: `, err.message);
    return { success: false, message: err.message };
  }
}

/*
 * INFO: Function to get income table attributes
 */
function get_income() {
  const sql = `SELECT * FROM ${income_table}`;
  try {
    const rows = db.prepare(sql).all();
    console.log(`[✓] All income: `, rows);
    return rows;
  } catch (err) {
    console.error(`[x] Failed to fetch income: `, err.message);
  }
}

function get_income_by_user(user_id) {
  const sql = `SELECT * FROM ${income_table} WHERE user_id = ?`;
  try {
    const rows = db.prepare(sql).all(user_id);
    console.log(`[✓] Income for user ${user_id}: `, rows);
    return rows;
  } catch (err) {
    console.error(`[x] Failed to fetch income for user: `, err.message);
  }
}

// Exporting functions
module.exports = { create_income_table, insert_income, get_income, get_income_by_user, edit_income_by_id };
