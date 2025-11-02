import { useState, useEffect } from "react";
import VerticalNavbar from "./VerticalNavbar";

import { ToastContainer, toast } from "react-toastify";

import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Income() {
  /* INFO: useStates */
  const [inc_name, setInc_name] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    /* Make sure form is filled */
    if (!inc_name || !amount || !date) {
      toast.warn("Please Fill in all fields")
      return;
    }

    const incomeData = {
      inc_name,
      amount: parseFloat(amount),
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/income", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(incomeData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Income added successfully.");
        setInc_name();
        setAmount();
        setDate();
      } else {
        toast.error(data.message, "Failed to add income.");
      }

    } catch (err) {
      console.log("Error adding income.", err);
      toast.error("An error occurred while adding the income.");
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
              <p className="text-xl font-medium my-3">Add Income</p>
              <hr className="text-current/50 my-5 shadow shadow-current/20" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="inc_name" className="block text-xl font-medium text-gray-700 w-1/8">Name<span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    id="inc_name"
                    value={inc_name}
                    placeholder="Enter name"
                    onChange={(e) => setInc_name(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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

                <button type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-400 hover:ring-2 hover:shadow-current/30" >Add Income</button>
              </form>
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}
