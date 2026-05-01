// backend/db/expense_income.js

const pool = require("./db.js");


/*
 * INFO: Define table attributes and create table if not exists
 */
const expense_table = 'expense';

/* TODO feature to add income or set budget and show report and warning accordingly */

/*
 * INFO: Function to create table if it doesn't exist
 */

async function create_expense_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${expense_table} (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES login_users(id),
      categories    TEXT NOT NULL,
      subcategories TEXT NOT NULL,
      amount        INTEGER NOT NULL,
      date          TIMESTAMPTZ
    )
  `;

  try {
    await pool.query(sql);
    console.log(`[INFO] Table ${expense_table} created or already exists.`)
  } catch (err) {
    console.error("[ERROR] Failed to create table.", err.message);
  }
}

/*
 * TODO: Function to crate income table or budget table.
 * NOTE: (useless) might be useful in the future.
 */
// function create_income_table() {
//   const sql = `
//     CREATE TABLE IF NOT EXISTS ${income_table} (
//       ${income_attributes}
//     )
//   `;
//   try {
//     db.prepare(sql).run();
//     console.log(`[✓] Table ${income_table} created or already exists.`);
//   } catch (err) {
//     console.error(`[x] Failed to create table: `, err.message);
//   }
// }

/* INFO Function to insert a expense */
async function insert_expense(user_id, amount, categories, subcategories, date) {
  const sql = `
    INSERT INTO ${expense_table} (user_id, amount, categories, subcategories, date)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [user_id, amount, categories, subcategories, date];

  try {
    const result = await pool.query(sql, values);
    console.log(`[SUCCESS] Inserted expense with ID: ${result.rowCount}`);
  } catch (err) {
    console.error("[ERROR] Failed to insert expense: ", err.message);
  }
}

/* INFO Edit expense table by user_id & id */
async function edit_expenses_by_user(user_id, expense_id, amount, categories, subcategories, date) {
  const sql = `
    UPDATE ${expense_table}
    SET amount = $1, categories = $2, subcategories = $3, date = $4
    WHERE user_id = $5 AND id = $6
    `;
  const values = [amount, categories, subcategories, date, user_id, id];

  try {
    const result = await pool.query(sql, values);
    if (result.changes > 0) {
      console.log(`[SUCCESS] Updated expense with ID: ${expense_id}`);
      return { success: true, message: "Expense updated successfully" };
    } else {
      console.error(`[WARN] No expense found with ID: ${expense_id} for user ID: ${user_id}`);
      return { success: false, message: "Expense not found or not updated" };
    }
  } catch (err) {
    console.error(`[ERROR] Failed to update expense`, err.message);
    return { success: false, message: err.message };
  }
}

/* INFO Function to get expense table attributes */
async function get_expense() {
  const sql = `SELECT * FROM ${expense_table}`;

  try {
    const result = await pool.query(sql);
    console.log("[INFO] All expense: ", result);
    return result.rows;
  } catch (err) {
    console.errror("[ERROR] Failed to fetch expense: ", err.message);
  }
}

/* INFO Get expenses by categories */
async function get_expense_by_categorie(categories) {
  return await pool.query(`SELECT * FROM ${expense_table} WHERE categories = $1`, [categories]);
}

/* INFO Get expenses by user_id */
async function get_expenses_by_user(user_id) {
  const sql = `SELECT * FROM ${expense_table} WHERE user_id = $1`;
  try {
    const result = await pool.query(sql, [user_id]);
    console.log(`[INFO] Expenses for user ${user_id}: `, result.rows);
    return result.rows;
  } catch (err) {
    console.error(`[INFO] Failed to fetch expenses for user: `, err.message);
    throw err;
  }
}

// Exporting functions
module.exports = { create_expense_table, insert_expense, get_expense, get_expense_by_categorie, get_expenses_by_user, edit_expenses_by_user };
