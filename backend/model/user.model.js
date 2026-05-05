const pool = require("../db/db.js");

const TABLE = "login_users";

async function create_user_table() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id         SERIAL PRIMARY KEY,
      user_name  TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(query);
    console.log(`[INFO] Table ${TABLE} is ready.`);
  } catch (err) {
    console.error("[ERROR] create_user_table:", err.message);
  }
}

async function insert_user(user_name, email, password) {
  const query = `
    INSERT INTO ${TABLE} (user_name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const values = [user_name, email, password];
  const result = await pool.query(query, values);

  return result.rows[0];
}

async function get_user_by_email(email) {
  const query = `
    SELECT *
    FROM ${TABLE}
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0] || null;
}

async function get_user_by_id(id) {
  const query = `
    SELECT id, user_name, email, created_at
    FROM ${TABLE}
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

async function update_user_by_id(id, user_name, email) {
  const query = `
    UPDATE ${TABLE}
    SET user_name = $1, email = $2
    WHERE id = $3
  `;

  const values = [id, user_name, email];
  const result = await pool.query(query, values);

  return result.rowCount;
}

async function update_password_by_id(id, new_password) {
  const query = `
    UPDATE ${TABLE} SET password = $1 WHERE id = $2
  `;
  const result = await pool.query(query, [new_password, id]);

  return result.rowCount;
}

async function delete_user_by_id(id) {
  const query = `
    DELETE FROM ${TABLE} WHERE id = $1
  `;
  const result = await pool.query(query, [id]);

  return result.rowCount;
}

async function get_user_profile_by_id(id) {
  const user_query = `
    SELECT id, user_name, email, created_at
    FROM ${TABLE}
    WHERE id = $1
  `;
  const user_result = await pool.query(user_query, [id]);
  if (!user_result.rows[0]) return null;

  const avatar_query = `
    SELECT id FROM user_avatars
    WHERE user_id = $1
  `;
  const avatar_result = await pool.query(avatar_query, [id]);

  return {
    ...user_result.rows[0],
    has_avatar: !!avatar_result.rows[0],
  };
}

module.exports = {
  create_user_table,
  insert_user,
  get_user_by_email,
  get_user_by_id,
  update_user_by_id,
  update_password_by_id,
  delete_user_by_id,
  get_user_profile_by_id
};
