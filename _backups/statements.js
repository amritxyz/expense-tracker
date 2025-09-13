const db = require('sqlite3')('database.db')

function create_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER
    )
  `;
  db.prepare(sql).run();
}

function insert_table() {
  const sql = `
    INSERT INTO users(name, age)
    VALUES (?, ?)
  `;
  db.prepare(sql).run();
}

create_table();
insert_table("susma", 42);
