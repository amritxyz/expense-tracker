const {
  insert_income,
  get_income_by_user,
  update_income,
  delete_income,
} = require("../model/income.model");

async function create(req, res, next) {
  try {
    const { inc_source, amount, date } = req.body;
    const user_id = req.user.id;

    if (!inc_source || !amount || !date) {
      return res.status(400).json({ message: "inc_source, amount, and date are required." });
    }

    const income = await insert_income(user_id, inc_source, amount, date);
    return res.status(201).json({ message: "Income created.", income });
  } catch (err) {
    next(err);
  }
}

async function get_all(req, res, next) {
  try {
    const income = await get_income_by_user(req.user.id);
    return res.status(200).json(income);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { inc_source, amount, date } = req.body;
    const user_id = req.user.id;

    if (!inc_source || !amount || !date) {
      return res.status(400).json({ message: "inc_source, amount, and date are required." });
    }

    const rows = await update_income(user_id, id, inc_source, amount, date);
    if (!rows) return res.status(404).json({ message: "Income not found." });

    return res.status(200).json({ message: "Income updated." });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await delete_income(req.user.id, id);
    if (!rows) return res.status(404).json({ message: "Income not found." });
    return res.status(200).json({ message: "Income deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get_all, update, remove };
