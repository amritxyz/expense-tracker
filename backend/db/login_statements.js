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
const table_name = 'login_users';
const first_attr = 'id';
const second_attr = 'user_name';
const third_attr = 'email';
const last_attr = 'password';
const extra_attr = 'created_at';

const attributes = `
  ${first_attr}   INTEGER PRIMARY KEY AUTOINCREMENT,
  ${second_attr}  TEXT NOT NULL,
  ${third_attr}  TEXT NOT NULL,
  ${last_attr}    TEXT NOT NULL,
  ${extra_attr}   DATETIME DEFAULT CURRENT_TIMESTAMP
`;

/*
 * INFO: Function to create table if it doesn't exist
 */
function create_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${table_name} (
      ${attributes}
    )
  `;
  try {
    db.prepare(sql).run();
    console.log(`[✓] Table ${table_name} created or already exists.`);
  } catch (err) {
    console.error(`[x] Failed to create table: `, err.message);
  }
}

/*
 * INFO: Function to insert a new user into the table
 */
function insert_user(user_name, email, password) {
  const sql = `
    INSERT INTO ${table_name} (${second_attr}, ${third_attr}, ${last_attr})
    VALUES (?, ?, ?)
  `;
  try {
    const result = db.prepare(sql).run(user_name, email, password);
    console.log(`[✓] Inserted user with ID: ${result.lastInsertRowid}`);
  } catch (err) {
    console.error(`[x] Failed to insert user: `, err.message);
  }
}

/*
 * INFO: Function to get all users from the table
 */
function get_users() {
  const sql = `SELECT * FROM ${table_name}`;
  try {
    const rows = db.prepare(sql).all();
    console.log(`[✓] All users: `, rows);
    return rows;
  } catch (err) {
    console.error(`[x] Failed to fetch users: `, err.message);
  }
}

function get_user_by_email(email) {
  return db.prepare(`SELECT * FROM ${table_name} WHERE email = ?`).get(email);
}

function get_user_by_id(id) {
  return db.prepare(`SELECT id, user_name, email, created_at FROM ${table_name} WHERE id = ?`).get(id);
}

function update_user_by_id(id, user_name, email) {
  const sql = `UPDATE ${table_name} SET ${second_attr} = ?, ${third_attr} = ? WHERE ${first_attr} = ?`;
  const result = db.prepare(sql).run(user_name, email, id);
  return { changes: result.changes };
}

// Exporting functions
module.exports = { create_table, insert_user, get_users, get_user_by_email, get_user_by_id, update_user_by_id };
