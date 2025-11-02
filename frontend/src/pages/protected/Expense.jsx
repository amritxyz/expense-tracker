import { useState, useEffect } from "react";
import VerticalNavbar from "./VerticalNavbar";
import { ToastContainer, toast } from "react-toastify";

import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Expense() {
  /* INFO: useStates */
  const [exp_name, setExp_name] = useState("");
  const [categories, setCategories] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    /* Make sure form is filled */
    if (!exp_name || !categories || !amount || !date) {
      toast.warn("Please Fill in all fields")
      return;
    }

    const expenseData = {
      exp_name,
      categories,
      amount: parseFloat(amount),
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
        toast.success("Expense added successfully.");
        setExp_name();
        setCategories();
        setAmount();
        setDate();
      } else {
        toast.error(data.message, "Failed to add expenses.");
      }

    } catch (err) {
      console.log("Error adding expenses.", err);
      toast.error("An error occurred while adding the expenses.");
    }
  };

  const [transactions, setTransactions] = useState([]);

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
  }, []);

  // NOTE: data for doughnut chart
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBudget = totalIncome - totalExpense;
  const percentageBudget = (totalBudget * 100) / totalIncome;

  const doughnutData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ["#4ade80", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  // INFO: Data for line chart
  // Get last 7 days
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

  // Sum transactions per day
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

  const lineData = {
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
  };

  // function AddCard() {
  //   return (
  //     <div className="border-[2px] rounded-xl border-current/20  h-[12rem] w-[16rem] bg-current/10">
  //       <div className="text-[4rem] text-current/50 text-center flex items-center justify-center h-full w-full">
  //         <span>+</span>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className="md:ml-64 h-screen bg-blue-50 gap-y-6 flex flex-col">
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

          <div className="w-full flex items-center justify-center">
            <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
              <p className="text-xl font-medium my-3">Add new Expense</p>
              <hr className="text-current/50 my-5 shadow shadow-current/20" />

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="flex items-center space-x-4">
                  <label htmlFor="exp_name" className="block text-xl font-medium text-gray-700 w-1/8">Name<span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    id="exp_name"
                    value={exp_name}
                    placeholder="Enter name"
                    onChange={(e) => setExp_name(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Field */}
                <div className="flex items-center space-x-4">
                  <label htmlFor="categories" className="block text-xl font-medium text-gray-700 w-1/8">
                    Category <span className="text-red-400">*</span>
                  </label>

                  {/* Dropdown for Category */}
                  <select
                    id="categories"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Rent">Rent</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Amount Field */}
                <div className="flex items-center space-x-4">
                  <label htmlFor="amount" className="block text-xl font-medium text-gray-700 w-1/8">Amount<span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    placeholder="Enter amount"
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date Field */}
                <div className="flex items-center space-x-4">
                  <label htmlFor="date" className="block text-xl font-medium text-gray-700 w-1/8">Date<span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Add Expense
                </button>
              </form>
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}
