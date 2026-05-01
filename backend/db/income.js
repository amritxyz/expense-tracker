// backend/db/income.js

const pool = require("./db.js");

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
async function create_income_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${income_table} (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES login_users(id),
      inc_source TEXT NOT NULL,
      categories TEXT DEFAULT 'income',
      amount     INTEGER NOT NULL,
      date       TIMESTAMPTZ
    )
  `;

  try {
    await pool.query(sql);
    console.log(`[INFO] Table ${income_table} created or already exists.`);
  } catch (err) {
    console.error(`[ERROR] Failed to create table: `, err.message);
  }
}

/* INFO Function to insert a income */
async function insert_income(user_id, inc_source, amount, date) {
  const sql = `
    INSERT INTO ${income_table} (user_id, inc_source, amount, date)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [user_id, inc_source, amount, date];
  try {
    const result = await pool.query(sql, values);
    console.log(`[SUCCESS] Inserted income with ID: ${result.rowCount}`);
  } catch (err) {
    console.error(`[ERROR] Failed to insert income: `, err.message);
  }
}

/* INFO Edit income table by id */
async function edit_income_by_id(user_id, id, inc_source, amount, date) {
  const categories = "income";
  const sql = `
    UPDATE ${income_table}
    SET inc_source = $1, categories = $2, amount = $3, date = $4
    WHERE user_id = $5 AND id = $6
  `;
  const values = [inc_source, categories, amount, date, user_id, id];
  try {
    const result = await pool.query(sql, values);
    if (result.rowCount > 0) {
      console.log(`[SUCCESS] Updated income with ID: ${id}`);
      return { success: true, message: "Expense updated successfully." };
    } else {
      console.log(`[INFO] No income found with ID: ${id} for user ID: ${user_id}`);
      return { success: false, message: "Expense not found or not updated." };
    }
  } catch (err) {
    console.error(`[ERROR] Failed to update income: `, err.message);
    return { success: false, message: err.message };
  }
}

/* INFO Function to get income table attributes */
async function get_income() {
  const sql = `SELECT * FROM ${income_table}`;
  try {
    const result = await pool.query(sql);
    console.log(`[INFO] All income: `, result);
    return result.rows;
  } catch (err) {
    console.error(`[ERROR] Failed to fetch income: `, err.message);
  }
}

/* INFO get income by user_id */
async function get_income_by_user(user_id) {
  const sql = `SELECT * FROM ${income_table} WHERE user_id = $1`;
  try {
    const result = await pool.query(sql, [user_id]);
    console.log(`[INFO] Income for user ${user_id}: `, result.rows);
    return result.rows;
  } catch (err) {
    console.error(`[ERROR] Failed to fetch income for user: `, err.message);
    throw err;
  }
}

module.exports = {
  create_income_table, insert_income, get_income, get_income_by_user,
  edit_income_by_id
};
