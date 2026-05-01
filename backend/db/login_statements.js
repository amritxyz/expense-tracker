// backend/db/login_statements.js

const pool = require("./db.js");

/* INFO Table name */
const table_name = 'login_users';

/* INFO create table if it doesn't exist */
async function create_user_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${table_name} (
      id         SERIAL PRIMARY KEY,
      user_name  TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(sql);
    console.log(`[INFO] Table ${table_name} created or already exists.`);
  } catch (err) {
    console.error("[ERROR] Failed to create table.", err);
  }
}

/* INFO insert a new user into the table */
async function insert_user(user_name, email, password) {
  const sql = `
    INSERT INTO ${table_name} (user_name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [user_name, email, password];

  try {
    const result = await pool.query(sql, values);
    console.log("[SUCCESS] Inserted user:", result.rows[0].id);
  } catch (err) {
    console.error("[ERROR] Failed to insert user.", err.message);
    throw err;
  }
}

/* INFO get all users from the table */
async function get_users() {
  const sql = `SELECT * FROM ${table_name}`;

  try {
    const result = await pool.query(sql);
    console.log("[SUCCESS] All users: ", result.rows);
    return result.rows;
  } catch (err) {
    console.error("[ERROR] Failed to fetch users: ", err.message);
  }
}

/* INFO Get user by email */
async function get_user_by_email(email) {
  const result = await pool.query(`SELECT * FROM ${table_name} WHERE email = $1`, [email]);
  console.log("[DEBUG] get_user_by_email result:", result.rows); // ← add this
  return result.rows[0];
}

/* INFO Get user by id */
async function get_user_by_id(id) {
  const sql = `
    SELECT id, user_name, email, created_at from ${table_name}
    WHERE id = $1`
    ;

  const result = await pool.query(sql, [id]);
  return result;
}

/* INFO Update user_name and email by id */
async function update_user_by_id(id, user_name, email) {
  const sql = `UPDATE ${table_name} SET user_name = $1, email = $2 WHERE id = $3`;

  const result = await pool.query(sql, [user_name, email, id]);
  return result;
}

/* INFO Delete user by id */
async function delete_user_by_id(id) {
  const sql = `DELETE FROM ${table_name} WHERE id = $1`;

  try {
    const result = await pool.query(sql, [id]);

    console.log(`[SUCCESS] Deleted user with ID: ${id}, changes: ${result.changes}`);
    return {
      success: result.changes > 0,
      changes: result.changes,
      message: result.changes > 0 ? "User deleted successfully" : "User not found"
    };
  } catch (err) {
    console.error("[ERROR] Failed to delete user.");
    return {
      success: false,
      change: 0,
      message: err.message
    };
  }
}

/* INFO Update password by id */
async function update_user_password_by_id(id, current_password, new_password) {
  try {
    const sql = `SELECT * FROM ${table_name} WHERE id = $1`;
    const user = await get_user_by_id(id);
    if (!user) return { success: false, message: "User not found." };
    const full_user = await pool.query(sql, [id]);

    if (full_user.rows[0].password !== current_password) {
      return { success: false, message: "Wrong password" };
    }

    const new_sql = `UPDATE ${table_name} SET password = $1 WHERE id = $2`
    const result = await pool.query(new_sql, [new_password, id]);

    return {
      success: result.rowCount > 0,
      changes: result.rowCount,
      message: result.rowCount > 0 ? "Password updated successfully" : "Failed to update password"
    };

  } catch (err) {
    console.error("[ERROR] Failed to update password.", err.message);
    return {
      success: false,
      changes: 0,
      message: err.message
    };
  }
}

async function get_user_profile_by_id(id) {
  const user_sql = `SELECT id, user_name, email, created_at FROM ${table_name} WHERE id = $1`;
  const user = await pool.query(user_sql, [id]);

  console.log("[DEBUG] user query result:", user.rows); // ← add this temporarily

  if (!user.rows[0]) return null;

  // Just check if avatar exists, don't fetch the binary data
  const avatar_sql = `SELECT id FROM user_avatars WHERE user_id = $1`;
  const avatar = await pool.query(avatar_sql, [id]);

  return {
    ...user.rows[0],
    avatar: avatar.rows[0] ? true : null // frontend builds the URL from user.id
  };
}

// Exporting functions
module.exports = {
  create_user_table, insert_user, get_users, get_user_by_email,
  get_user_by_id, update_user_by_id, delete_user_by_id,
  update_user_password_by_id, get_user_profile_by_id
};
