const pool = require("../db/db");

const TABLE = "user_avatars"

async function create_avatar_table() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL UNIQUE,
      avatar_data BYTEA NOT NULL,
      mime_type   TEXT NOT NULL DEFAULT 'image/jpeg',
      created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES login_users(id) ON DELETE CASCADE
    )
  `;
  try {
    await pool.query(query);
    console.log('[INFO] Table user_avatars ready.');
  } catch (err) {
    console.error('[ERROR] create_avatar_table:', err.message);
  }
}

async function upsert_user_avatar(user_id, avatar_buffer, mime_type) {
  const query = `
    INSERT INTO ${TABLE} (user_id, avatar_data, mime_type, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET
      avatar_data = EXCLUDED.avatar_data,
      mime_type   = EXCLUDED.mime_type,
      updated_at  = CURRENT_TIMESTAMP
  `;
  await pool.query(query, [user_id, avatar_buffer, mime_type]);
  return true;
}

async function get_avatar_by_user_id(user_id) {
  const query = `
    SELECT avatar_data, mime_type
    FROM ${TABLE}
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] || null;
}

async function delete_user_avatar(user_id) {
  const query = `
    DELETE FROM ${TABLE}
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [user_id]);
  return result.rowCount > 0;
}

module.exports = {
  create_avatar_table,
  upsert_user_avatar,
  get_avatar_by_user_id,
  delete_user_avatar,
};
