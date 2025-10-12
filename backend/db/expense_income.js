// backend/db/login_statements.js

const Database = require('better-sqlite3');
const path = require('path');

/*
 * INFO: Define the database path
 */
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath, { verbose: console.log });

/*
 * INFO: Define table attributes and create table if not exists
 */
const expense_table = 'expense';
const first_attr = 'id';
const second_attr = 'categories';
const third_attr = 'amount';
const extra_attr = 'date';

const expense_attributes = `
  ${first_attr}   INTEGER PRIMARY KEY AUTOINCREMENT,
  ${second_attr}  TEXT NOT NULL,
  ${third_attr}  INTEGER NOT NULL,
  ${extra_attr}   DATETIME DEFAULT
`;

/*
 * TODO: feature to add income or set budget and show report and warning accordingly
 */
// const income_table = 'income';
// const income_attributes = `
//   ${first_attr}   INTEGER PRIMARY KEY AUTOINCREMENT,
//   ${second_attr}  TEXT NOT NULL,
//   ${third_attr}  INTEGER NOT NULL,
//   ${extra_attr}   DATETIME DEFAULT
// `;

/*
 * INFO: Function to create table if it doesn't exist
 */
function create_expense_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${expense_table} (
      ${expense_attributes}
    )
  `;
  try {
    db.prepare(sql).run();
    console.log(`[✓] Table ${expense_table} created or already exists.`);
  } catch (err) {
    console.error(`[x] Failed to create table: `, err.message);
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
//   } catch {
//     console.error(`[x] Failed to create table: `, err.message);
//   }
// }

/*
 * INFO: Function to insert a expense
 */
function insert_expense(categories, amount, date) {
  const sql = `
    INSERT INTO ${expense_table} (${second_attr}, ${third_attr}, ${extra_attr})
    VALUES (?, ?, ?)
  `;
  try {
    const result = db.prepare(sql).run(categories, amount, date);
    console.log(`[✓] Inserted expense with ID: ${result.lastInsertRowid}`);
  } catch (err) {
    console.error(`[x] Failed to insert expense: `, err.message);
  }
}

/*
 * INFO: Function to get expense table attributes
 */
function get_expense() {
  const sql = `SELECT * FROM ${expense_table}`;
  try {
    const rows = db.prepare(sql).all();
    console.log(`[✓] All expenses: `, rows);
    return rows;
  } catch (err) {
    console.error(`[x] Failed to fetch expenses: `, err.message);
  }
}

function get_expense_by_categorie(categories) {
  return db.prepare(`SELECT * FROM ${expense_table} WHERE categories = ?`).get(categories);
}

// Exporting functions
module.exports = { create_expense_table, insert_expense, get_expense, get_expense_by_categorie };
