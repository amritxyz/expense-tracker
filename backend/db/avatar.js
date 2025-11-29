// backend/db/avatar.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

/*
 * INFO: Create avatar table
 */
function create_avatar_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_avatars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      avatar_filename TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES login_users(id) ON DELETE CASCADE
    )
  `;
  try {
    db.prepare(sql).run();
    console.log(`[✓] Table user_avatars created or already exists.`);
  } catch (err) {
    console.error(`[x] Failed to create avatar table: `, err.message);
  }
}

/*
 * INFO: Insert or update user avatar
 */
function upsert_user_avatar(user_id, avatar_filename, avatar_url) {
  const checkSql = `SELECT * FROM user_avatars WHERE user_id = ?`;
  const existing = db.prepare(checkSql).get(user_id);

  if (existing) {
    // Delete old avatar file
    try {
      const oldFilePath = path.join(avatarsDir, existing.avatar_filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (err) {
      console.error('Error deleting old avatar file:', err.message);
    }

    // Update existing record
    const updateSql = `
      UPDATE user_avatars 
      SET avatar_filename = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ?
    `;
    const result = db.prepare(updateSql).run(avatar_filename, avatar_url, user_id);
    return { success: result.changes > 0, action: 'updated' };
  } else {
    // Insert new record
    const insertSql = `
      INSERT INTO user_avatars (user_id, avatar_filename, avatar_url) 
      VALUES (?, ?, ?)
    `;
    const result = db.prepare(insertSql).run(user_id, avatar_filename, avatar_url);
    return { success: true, action: 'inserted' };
  }
}

/*
 * INFO: Get user avatar by user_id
 */
function get_avatar_by_user_id(user_id) {
  const sql = `SELECT * FROM user_avatars WHERE user_id = ?`;
  return db.prepare(sql).get(user_id);
}

/*
 * INFO: Delete user avatar
 */
function delete_user_avatar(user_id) {
  const sql = `SELECT * FROM user_avatars WHERE user_id = ?`;
  const avatar = db.prepare(sql).get(user_id);

  if (avatar) {
    // Delete file
    try {
      const filePath = path.join(avatarsDir, avatar.avatar_filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting avatar file:', err.message);
    }

    // Delete database record
    const deleteSql = `DELETE FROM user_avatars WHERE user_id = ?`;
    const result = db.prepare(deleteSql).run(user_id);
    return { success: result.changes > 0 };
  }
  return { success: false, message: 'Avatar not found' };
}

module.exports = {
  create_avatar_table,
  upsert_user_avatar,
  get_avatar_by_user_id,
  delete_user_avatar,
  avatarsDir
};
