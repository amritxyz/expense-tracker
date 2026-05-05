const pool = require("../db/db");

const TABLE = "income";

async function create_income_table() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES login_users(id) ON DELETE CASCADE,
      inc_source TEXT NOT NULL,
      categories TEXT DEFAULT 'income',
      amount     INTEGER NOT NULL,
      date       TIMESTAMPTZ
    )
  `;
  try {
    await pool.query(query);
    console.log(`[INFO] Table ${TABLE} ready.`);
  } catch (err) {
    console.error('[ERROR] create_income_table:', err.message);
  }
}

async function insert_income(user_id, inc_source, amount, date) {
  const query = `
    INSERT INTO ${TABLE} (user_id, inc_source, amount, date)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [user_id, inc_source, amount, date]);
  return result.rows[0];
}

async function get_income_by_user(user_id) {
  const query = `
    SELECT * FROM ${TABLE}
    WHERE user_id = $1
    ORDER BY date DESC
  `;

  const result = await pool.query(query, [user_id]);
  return result.rows;
}

async function update_income(user_id, income_id, inc_source, amount, date) {
  const query = `
    UPDATE ${TABLE}
    SET inc_source = $1, amount = $2, date = $3
    WHERE user_id = $4 AND id = $5
  `;
  const result = await pool.query(query, [inc_source, amount, date, user_id, income_id]);
  return result.rowCount;
}

async function delete_income(user_id, income_id) {
  const query = `
    DELETE FROM ${TABLE}
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [income_id, user_id]);
  return result.rowCount;
}

module.exports = {
  create_income_table,
  insert_income,
  get_income_by_user,
  update_income,
  delete_income,
};
