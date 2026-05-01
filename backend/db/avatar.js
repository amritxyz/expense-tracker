// backend/db/avatar.js
const pool = require('./db.js'); // your pg pool

/*
 * INFO: Create avatar table
 */
async function create_avatar_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_avatars (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      avatar_data BYTEA NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES login_users(id) ON DELETE CASCADE
    )
  `;
  try {
    await pool.query(sql);
    console.log(`[✓] Table user_avatars created or already exists.`);
  } catch (err) {
    console.error(`[x] Failed to create avatar table: `, err.message);
  }
}

/*
 * INFO: Insert or update user avatar
 */
async function upsert_user_avatar(user_id, avatar_buffer, mime_type) {
  const sql = `
    INSERT INTO user_avatars (user_id, avatar_data, mime_type, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id)
    DO UPDATE SET
      avatar_data = EXCLUDED.avatar_data,
      mime_type = EXCLUDED.mime_type,
      updated_at = CURRENT_TIMESTAMP
  `;
  try {
    await pool.query(sql, [user_id, avatar_buffer, mime_type]);
    return { success: true };
  } catch (err) {
    console.error('[ERROR] Failed to upsert avatar: ', err.message);
    throw err;
  }
}

/*
 * INFO: Get user avatar by user_id
 */
async function get_avatar_by_user_id(user_id) {
  const sql = `SELECT avatar_data, mime_type FROM user_avatars WHERE user_id = $1`;
  try {
    const result = await pool.query(sql, [user_id]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('[ERROR] Failed to get avatar: ', err.message);
    throw err;
  }
}

/*
 * INFO: Delete user avatar
 */
async function delete_user_avatar(user_id) {
  const sql = `DELETE FROM user_avatars WHERE user_id = $1`;
  try {
    const result = await pool.query(sql, [user_id]);
    return { success: result.rowCount > 0 };
  } catch (err) {
    console.error('[ERROR] Failed to delete avatar: ', err.message);
    throw err;
  }
}

module.exports = {
  create_avatar_table,
  upsert_user_avatar,
  get_avatar_by_user_id,
  delete_user_avatar,
};
