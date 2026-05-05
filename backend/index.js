const express = require("express");
const cors = require("cors");

const { CORS_ORIGIN } = require("./constant.js");

/* Routes */
const auth_route = require("./route/auth.route");
const expense_route = require("./route/expense.route");
const income_route = require("./route/income.route");
const profile_route = require("./route/profile.route");

/* Middleware */
const error_handler = require("./middleware/error.middleware");
const request_logger = require("./middleware/logger.middleware");

/* Database */
const { create_user_table } = require("./model/user.model");
const { create_expense_table } = require("./model/expense.model");
const { create_income_table } = require("./model/income.model");
const { create_avatar_table } = require("./model/avatar.model");

const app = express();

/* Middleware */
app.use(request_logger);
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Database creation in startup */
(async () => {
  await create_user_table();
  await create_expense_table();
  await create_income_table();
  await create_avatar_table();
})();

/* Routes */
app.use("/auth", auth_route);
app.use("/expenses", expense_route);
app.use("/income", income_route);
app.use("/profile", profile_route);

/* 404 page */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
})

/* Error handler */
app.use(error_handler);

module.exports = app;
