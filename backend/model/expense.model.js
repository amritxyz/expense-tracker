const pool = require("../db/db");

const TABLE = "expense";

async function create_expense_table() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES login_users(id) ON DELETE CASCADE,
      categories    TEXT NOT NULL,
      subcategories TEXT NOT NULL,
      amount        INTEGER NOT NULL,
      date          TIMESTAMPTZ
    )
  `;
  try {
    await pool.query(sql);
    console.log(`[INFO] Table ${TABLE} ready.`);
  } catch (err) {
    console.error('[ERROR] create_expense_table:', err.message);
  }
}

async function insert_expense(user_id, amount, categories, subcategories, date) {
  const sql = `
    INSERT INTO ${TABLE} (user_id, amount, categories, subcategories, date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const result = await pool.query(sql, [user_id, amount, categories, subcategories, date]);
  return result.rows[0];
}

async function get_expenses_by_user(user_id) {
  const result = await pool.query(
    `SELECT * FROM ${TABLE} WHERE user_id = $1 ORDER BY date DESC`, [user_id]
  );
  return result.rows;
}

async function update_expense(user_id, expense_id, amount, categories, subcategories, date) {
  const sql = `
    UPDATE ${TABLE}
    SET amount = $1, categories = $2, subcategories = $3, date = $4
    WHERE user_id = $5 AND id = $6
  `;
  const result = await pool.query(sql, [amount, categories, subcategories, date, user_id, expense_id]);
  return result.rowCount;
}

async function delete_expense(user_id, expense_id) {
  const result = await pool.query(
    `DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2`, [expense_id, user_id]
  );
  return result.rowCount;
}

module.exports = {
  create_expense_table,
  insert_expense,
  get_expenses_by_user,
  update_expense,
  delete_expense,
};
