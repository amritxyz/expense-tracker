import { useState, useEffect } from "react";
import VerticalNavbar from "./VerticalNavbar";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Button components
import DeleteButton from "../../components/buttons/DeleteButton";
import EditButton from "../../components/buttons/EditButton";

import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Expense() {
  /* INFO: useStates */
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Pop-up form / modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit Expense Modal
  const [selectedExpense, setSelectedExpense] = useState(null); // Track the selected expense details for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pop-up form / modal
  const [refreshKey, setRefreshKey] = useState(0); // Used for forcing component re-render
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected transaction ID for deletion
  const [doughnutData, setDoughnutData] = useState({
    labels: [],
    datasets: []
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  });


  const today = new Date().toISOString().split('T')[0];
  // Formik
  const initialValues = {
    amount: '',
    categories: '',
    description: '',
    date: ''
  };

  const validationSchema = Yup.object({
    amount: Yup.number().required('Amount is required').positive('Amount must be positive').integer('Amount must be an integer'),
    categories: Yup.string().required("Category is required"),
    description: Yup.string()
      .matches(/[a-zA-Z]/, 'Description must include at least one letter')
      .max(25, "Max 25 characters only")
      .required('Description is required'),
    date: Yup.date()
      .max(today, `Date cannot be in the future`)
      .required('Date is required')
  });

  // Handle Editing Expense
  const handleEditSubmit = async (values) => {
    toast.loading("Updating Expense...");
    const { amount, categories, description, date } = values;

    const expenseData = {
      amount: parseFloat(amount),
      categories,
      description,
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/expenses/${selectedItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (response.ok) {
        setIsEditModalOpen(false);
        toast.dismiss();
        toast.success("Expense updated successfully.");

        // Update the transactions state with the new data
        setTransactions((prevTransactions) =>
          prevTransactions.map((item) =>
            item.id === selectedItemId ? { ...item, ...expenseData } : item
          )
        );
        setRefreshKey((prevKey) => prevKey + 1); // Trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update the expense.");
      }
    } catch (err) {
      toast.dismiss();
      console.log("Error updating expense:", err);
      toast.error("An error occurred while updating the expense.");
    }
  };

  // const openEditModal = (expenseId) => {
  //   const expenseToEdit = transactions.find((expense) => expense.id === expenseId);
  //   setSelectedExpense(expenseToEdit);
  //   setSelectedItemId(expenseId);
  //   setIsEditModalOpen(true);
  // };

  async function handleSubmit(values) {
    toast.loading("Adding Expense...");
    const { amount, categories, description, date } = values;

    /* Make sure form is filled */
    if (!amount || !categories || !description || !date) {
      toast.dismiss();
      toast.warn("Please Fill in all fields")
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      categories,
      description,
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/expense", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        toast.dismiss();
        toast.success("Expense added successfully.");
        // setExp_name("");
        // setCategories("");
        // setAmount("");
        // setDate("");
        // Add the new expense to the state and refresh chart
        const newExpense = { ...expenseData, type: "expense", id: data.id }; // Assuming the response has the new expense ID
        setTransactions(prevTransactions => [newExpense, ...prevTransactions]);

        setRefreshKey((prevKey) => prevKey + 1); // Change the key to trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message, "Failed to add expenses.");
      }

    } catch (err) {
      toast.dismiss();
      console.log("Error adding expenses.", err);
      toast.error("An error occurred while adding the expenses.");
    }
  };

  async function handleDelete(id) {
    toast.loading("Deleting expense...");
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss();
        toast.success("Expense deleted successfully.");
        setTransactions(transactions.filter(transaction => transaction.id !== id));
        // Force re-render after deleting
        setRefreshKey((prevKey) => prevKey + 1); // Change the key to trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete the expense.");
      }
    } catch (err) {
      toast.dismiss();
      console.log("Error deleting expense:", err);
      toast.error("An error occurred while deleting the expense.");
    }
  }

  const [transactions, setTransactions] = useState([]);

  // NOTE: data for doughnut chart
  const categoryColors = {
    Food: "#ffcc00", // Yellow for Food
    Transportation: "#ffc0cb", // Green for Transportation
    Entertainment: "#2196f3", // Blue for Entertainment
    Utilities: "#ff5722", // Orange for Utilities
    Shopping: "#9c27b0", // Purple for Shopping
    Rent: "#673ab7", // Deep Purple for Rent
    Others: "#f44336", // Red for Others
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      fetch("http://localhost:5000/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("http://localhost:5000/income", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([expenses, income]) => {
        const formattedExpenses = expenses.map((e) => ({
          ...e,
          type: "expense",
        }));
        const formattedIncome = income.map((i) => ({
          ...i,
          type: "income",
        }));
        const all = [...formattedExpenses, ...formattedIncome].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setTransactions(all);
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }, [refreshKey]);

  useEffect(() => {
    // Get the expense data
    const expenseName = transactions
      .filter((t) => t.type === "expense")
      .map((t) => ({
        categories: t.categories,
        amount: Number(t.amount)
      }));

    const allExpenseName = expenseName.map((e) => e.categories);
    const allExpenseAmount = expenseName.map((e) => e.amount);

    const expenseColors = allExpenseName.map((name) => categoryColors[name] || "#cccccc");

    setDoughnutData({
      labels: allExpenseName,
      datasets: [
        {
          data: allExpenseAmount,
          backgroundColor: expenseColors,
          borderWidth: 1,
        },
      ],
    });
  }, [transactions]);

  // INFO: Data for line chart
  // Get last 7 days
  useEffect(() => {
    // Get the last 7 days
    const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
      }
      return days;
    };

    const last7Days = getLast7Days();

    // Calculate the income and expenses per day
    const incomePerDay = last7Days.map((day) =>
      transactions
        .filter((t) => t.type === "income" && t.date.startsWith(day))
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    const expensePerDay = last7Days.map((day) =>
      transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(day))
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    setLineData({
      labels: last7Days,
      datasets: [
        {
          label: "Income",
          data: incomePerDay,
          borderColor: "#4ade80",
          backgroundColor: "rgba(74, 222, 128, 0.2)",
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: expensePerDay,
          borderColor: "#f87171",
          backgroundColor: "rgba(248, 113, 113, 0.2)",
          tension: 0.4,
        },
      ],
    });
  }, [transactions]);

  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className={`md:ml-64 bg-blue-50 gap-y-6 flex flex-col ${`h-screen` ? `h-screen` : `h-full`} `}>
          <div className="flex items-center justify-center mt-6">
            <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
              <div className="w-full flex items-center justify-between">
                {/* Doughnut Chart */}
                <div className="w-[300px] md:w-[400px] p-4 ">
                  <Doughnut data={doughnutData} />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Doughnut chart </p>
                </div>
                {/* Bar Chart */}
                <div className="w-[400px] md:w-[800px] p-4">
                  <Line data={lineData} />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Bar chart </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
              </div>
              <p className="text-gray-600 text-[15px] text-center font-medium">Weekly Spending Trend</p>
            </div>
          </div>

          {isDeleteModalOpen && selectedItemId && (
            transactions.filter((t) => t.id === selectedItemId).map((item) => (
              <div className="fixed inset-0 flex justify-center items-center bg-current/40 bg-opacity-50 z-50">

                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <p className="text-xl font-medium mb-3">Delete</p>
                  <hr className="text-current/50 my-5 shadow shadow-current/20" />

                  <p className="text-xl font-xl mb-3">Are you sure?</p>
                  <div className="flex justify-end gap-2">
                    {/* Submit Button */}
                    <button
                      type="submit"
                      onClick={() => {
                        handleDelete(item.id);
                        setIsDeleteModalOpen(false);
                      }}
                      className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 cursor-pointer"
                    >
                      Confirm
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Edit Expense Modal */}
          {isEditModalOpen && selectedExpense && (
            <div className="fixed inset-0 flex justify-center items-center bg-current/40 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <p className="text-xl font-medium mb-3">Edit Expense</p>
                <hr className="text-current/50 my-5 shadow shadow-current/20" />

                <Formik
                  initialValues={{
                    amount: selectedExpense?.amount || '',
                    categories: selectedExpense?.categories || '',
                    description: selectedExpense?.description || '',
                    date: selectedExpense?.date || ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleEditSubmit}
                >
                  <Form>
                    <div className="mb-6">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount<span className="text-red-400">*</span>
                      </label>
                      <Field
                        type="number"
                        id="amount"
                        name="amount"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="amount" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                        Expense Category<span className="text-red-400">*</span>
                      </label>
                      <Field
                        as="select"
                        id="categories"
                        name="categories"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Food">Food</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Rent">Rent</option>
                        <option value="Others">Others</option>
                      </Field>
                      <ErrorMessage name="categories" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description<span className="text-red-400">*</span>
                      </label>
                      <Field
                        type="text"
                        id="description"
                        name="description"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date<span className="text-red-400">*</span>
                      </label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          )}

          {/* Modal - Add Expense Form */}
          {isModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-current/40 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <p className="text-xl font-medium mb-3">Add Expense</p>
                <hr className="text-current/50 my-5 shadow shadow-current/20" />

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  <Form>
                    {/* Amount */}
                    <div className="mb-6">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount<span className="text-red-400">*</span></label>
                      <Field
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder="Enter amount"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* categories */}
                    <div className="mb-4">
                      <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Expense Category<span className="text-red-400">*</span></label>
                      <Field
                        as="select"
                        id="categories"
                        name="categories"
                        placeholder="Freelancing, Salary, etc"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="" disabled>Select a category</option>
                        <option value="Food">Food</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Rent">Rent</option>
                        <option value="Others">Others</option>
                      </Field>
                      <ErrorMessage
                        name="categories"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* name */}
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description<span className="text-red-400">*</span></label>
                      <Field
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Remark"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>


                    {/* Date */}
                    <div className="mb-6 cursor-pointer">
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 cursor-pointer">Date<span className="text-red-400">*</span></label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        placeholder="Enter date"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                      >
                        Add Expense
                      </button>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-center">
            <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-gray-50 to-white mb-9">
              <div className="flex items-center justify-between text-center">
                <p className="text-gray-900 font-semibold ">Recent Expenses</p>

                <button onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-all cursor-pointer flex"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"></path>
                  </svg>
                  Add Expense
                </button>
              </div>
              <hr className="text-current/20 my-3 shadow shadow-current/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {transactions.filter((t) => t.type === "expense").map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 ${item.type === "income" ? "bg-green-50" : "bg-red-50"} relative group`}
                  >

                    {/* Categories */}
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-gray-900 capitalize">{item.categories}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-[12px] text-gray-900 capitalize font-medium">{item.date}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Edit button */}
                      <EditButton onClick={() => {
                        setSelectedExpense(item);
                        setSelectedItemId(item.id);
                        setIsEditModalOpen(true);
                      }}
                      />
                      {/* Delete Button - Only visible on hover */}
                      <DeleteButton
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setIsDeleteModalOpen(true);
                        }}
                      />
                      {/* Amount */}
                      <span className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`} >
                        Rs. {item.amount}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </>
  );
}
