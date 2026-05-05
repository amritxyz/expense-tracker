const {
  insert_expense,
  get_expenses_by_user,
  update_expense,
  delete_expense,
} = require("../model/expense.model");

async function create(req, res, next) {
  try {
    const { amount, categories, subcategories, date } = req.body;
    const user_id = req.user.id;

    if (!amount || !categories || !subcategories || !date) {
      return res.status(400).json({ message: "amount, categories, subcategories, and date are required." });
    }

    const expense = await insert_expense(user_id, amount, categories, subcategories, date);
    return res.status(201).json({ message: "Expense created.", expense });
  } catch (err) {
    next(err);
  }
}

async function get_all(req, res, next) {
  try {
    const expenses = await get_expenses_by_user(req.user.id);
    return res.status(200).json(expenses);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, categories, subcategories, date } = req.body;
    const user_id = req.user.id;

    if (!amount || !categories || !date) {
      return res.status(400).json({ message: "amount, categories, and date are required." });
    }

    const rows = await update_expense(user_id, id, amount, categories, subcategories, date);
    if (!rows) return res.status(404).json({ message: "Expense not found." });

    return res.status(200).json({ message: "Expense updated." });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await delete_expense(req.user.id, id);
    if (!rows) return res.status(404).json({ message: "Expense not found." });
    return res.status(200).json({ message: "Expense deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get_all, update, remove };
