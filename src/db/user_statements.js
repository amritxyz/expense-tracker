import sqlite3 from "better-sqlite3";

const db = sqlite3('database.db');

/*
 * INFO: function creates a table *users*
 */
function create_table() {
  const sql = `
    CREATE TABLEIF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER
    )
  `;
  db.prepare(sql).run();
}

/*
 * INFO: Insert into the table *users* attributes (name, age)
 */
function insert_table(name, age) {
  const sql = `
    INSERT INTO users(name, age)
    VALUES (?, ?)
  `;
  db.prepare(sql).run(name, age);
}

/*
 * INFO: Get all users from table *users* and print into the console (all)
 */
function get_users() {
  const sql = `
    SELECT * FROM users
  `;
  // WHERE age = 2
  const rows = db.prepare(sql).all();
  console.log(rows);
}

/*
 * INFO: Get (id) specific users from table *users*
 */
function get_user(id) {
  const sql = `
    SELECT * FROM users
    WHERE id = ?
  `;
  const row = db.prepare(sql).all(id);
  console.log(row);
}

/*
 * INFO: Function calls
 */
// create_table();
// insert_table("void", 2);
// get_users()
// get_user(2)
