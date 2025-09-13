import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// INFO: Setting up directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
 * INFO: Setup for SQLite database using better-sqlite3
 *   We are using `path.join(__dirname, "database.db")` to ensure the database path is
 *   resolved relative to current file's location. NOT from where the script is executed.
 *   (ie., `node db/database_name.db`).
 */
const db_path = path.join(__dirname, "database.db");
const db = new Database(db_path, { verbose: console.log });

// INFO: Database attributes.
const table_name = "login_users";
const first_attr = "id";
const second_attr = "user_name";
const third_attr = "email";
const last_attr = "password";
const extra_attr = "created_at";

/*
 * Defining SQL table attributes in a variable to enable reuse across
 * multiple parts of the codebase. This approach helps avoid duplication
 * and prevents potential collisions in SQL definitions.
 */
// ${third_attr}   TEXT NOT NULL,   // Email
const attributes = `
  ${first_attr}   INTEGER PRIMARY KEY AUTOINCREMENT,
  ${second_attr}  TEXT NOT NULL,
  ${third_attr}   TEXT NOT NULL,
  ${last_attr}  TEXT NOT NULL,
  ${extra_attr}   DATETIME DEFAULT CURRENT_TIMESTAMP
`;

/*
 * INFO: function creates a table *users* if not exist.
 */
function create_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${table_name} (
      ${attributes}
    )
  `;
  try {
    db.prepare(sql).run();
    console.log(`[✓] table ${table_name} created or already exists.`);
  } catch (err) {
    console.error(`[x] failed to create table: `, err.message);
  }
}

/*
 * INFO: Insert a new user(email, password, created_at) into the table *users*.
 */
function insert_table(user_name, email, password, date) {
  const sql = `
    INSERT INTO ${table_name}
    (${second_attr}, ${third_attr}, ${last_attr}, ${extra_attr})
    VALUES (?, ?, ?)
  `;
  try {
    const result = db.prepare(sql).run(email, password, date);
    console.log(`[✓] Inserted user with ID: ${result.lastInsertRowid}`);
  } catch (err) {
    console.error(`[x] Failed to insert user: `, err.message);
  }
}

/*
 * INFO: Get all users from table *users* and print into the console (all)
 */
function get_users() {
  const sql = `
    SELECT * FROM ${table_name}
  `;
  try {
    const rows = db.prepare(sql).all();
    console.log(`[✓] All users: `, rows);
  } catch (err) {
    console.error(`[x] failed to fetch users: `, err.message);
  }
}

/*
 * INFO: Get (id) specific users from table *users*
 */
function get_user(id) {
  const sql = `
    SELECT * FROM ${table_name}
    WHERE id = ?
  `;
  try {
    const row = db.prepare(sql).get(id);
    if (row) {
      console.log(`[✓] User found: `, row);
    } else {
      console.log(`[x] user not found with ID:`, id);
    }
  } catch (err) {
    console.error(`[x] Failed to fetch user: `, err.message);
  }
}

/*
 * INFO: Delete user from table *users* by (id).
 */
function delete_user(id) {
  const sql = `
    DELETE FROM ${table_name}
    WHERE ${first_attr} = ?
  `;
  try {
    const result = db.prepare(sql).run(id);
    if (result.changes > 0) {
      console.log(`[✓] Deleted user with ID: ${id}`);
      reset_autoincrement(); // Reset primary key or id
    }
  } catch (err) {
    console.log(`[x] Failed to delete the user:`, err.message);
  }
}

/*
 * INFO: Clear rows / primary keys from table *users*.
 */
function reset_autoincrement() {
  const sql = `
    DELETE FROM sqlite_sequence
    WHERE name = ?
  `;
  try {
    db.prepare(sql).run(table_name);
    console.log(`[✓] Auto-increment reset for table: ${table_name}`);
  } catch (err) {
    console.error(`[x] failed to reset autoincrement: `, err.message);
  }
}

/*
 * Reset the primary key sequences by recreating the table with fresh ROWIDs
 * This is a robust way to renumber IDs without gaps after deletions.
 * NOTE: This does NOT preserve original IDs, they became sequential starting at 1.
 */
function reset_whole_table_primary_keys() {
  const temp_table = "new_temp_table";

  try {
    const create_temp_sql = `
      CREATE TEMPORARY TABLE ${temp_table} AS
      SELECT ROW_NUMBER() OVER (ORDER BY ${first_attr}) AS ${first_attr},
             ${second_attr},
             ${last_attr},
             ${extra_attr}
      FROM ${table_name};
    `;
    db.prepare(create_temp_sql).run();

    const delete_sql = `DELETE FROM ${table_name};`;
    db.prepare(delete_sql).run();

    const copy_sql = `
      INSERT INTO ${table_name} (${first_attr}, ${second_attr}, ${last_attr}, ${extra_attr})
      SELECT ${first_attr}, ${second_attr}, ${last_attr}, ${extra_attr} FROM ${temp_table};
    `;
    db.prepare(copy_sql).run();

    db.prepare(`DROP TABLE ${temp_table};`).run(); // Drop old database

    reset_autoincrement();
    console.log(`[✓] successfully reset all primary keys in ${table_name}`);
  } catch (err) {
    console.error(`[x] failed to reset primary keys: `, err.message);
  }
}

// =============
// Example calls
// =============

// create_table();
// insert_table("amritxyz@gmail.com", "voidmain");
get_users();
// get_user(1);
// delete_user(1);
// reset_autoincrement();
// reset_whole_table_primary_keys();
