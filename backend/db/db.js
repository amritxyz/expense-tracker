const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "expense_tracker",
  user: "postgres",
  password: "",
});

pool.on("error", (err) => {
  console.error("[ERROR] unexpected pg pool error.", err.message);
})

module.exports = pool;
