import { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Recent() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  async function handleDelete(id, type) {
    toast.loading("Deleting expense...");
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.dismiss(loadingToast);
        toast.error("No token found. Please log in.");
        return; // Exit if there's no token
      }

      const endPoint = type == "income" ? `http://localhost:5000/income/${id}` : `http://localhost:5000/expenses/${id}`;

      const response = await fetch(endPoint, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        toast.dismiss();
        toast.success("Expense deleted successfully.");
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete the expense.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("An error occurred while deleting the expense.");
    }
  }

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
  // const getLast7Days = () => {
  //   const days = [];
  //   for (let i = 6; i >= 0; i--) {
  //     const d = new Date();
  //     d.setDate(d.getDate() - i);
  //     days.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  //   }
  //   return days;
  // };
  //
  // const last7Days = getLast7Days();
  //
  // // Sum transactions per day
  // const incomePerDay = last7Days.map((day) =>
  //   transactions
  //     .filter((t) => t.type === "income" && t.date.startsWith(day))
  //     .reduce((sum, t) => sum + Number(t.amount), 0)
  // );
  //
  // const expensePerDay = last7Days.map((day) =>
  //   transactions
  //     .filter((t) => t.type === "expense" && t.date.startsWith(day))
  //     .reduce((sum, t) => sum + Number(t.amount), 0)
  // );
  //
  // const lineData = {
  //   labels: last7Days,
  //   datasets: [
  //     {
  //       label: "Income",
  //       data: incomePerDay,
  //       borderColor: "#4ade80",
  //       backgroundColor: "rgba(74, 222, 128, 0.2)",
  //       tension: 0.4,
  //     },
  //     {
  //       label: "Expenses",
  //       data: expensePerDay,
  //       borderColor: "#f87171",
  //       backgroundColor: "rgba(248, 113, 113, 0.2)",
  //       tension: 0.4,
  //     },
  //   ],
  // };

  // INFO: For bar chart
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

  const barData = {
    labels: last7Days,
    datasets: [
      {
        label: "Income",
        data: incomePerDay,
        backgroundColor: "#4ade80",
      },
      {
        label: "Expenses",
        data: expensePerDay,
        backgroundColor: "#f87171",
      },
    ],
  };

  return (
    <section className="flex flex-col items-center space-y-6 ">

      <div className="w-full flex items-center justify-center mt-6">
        <div className="w-[90%] border border-gray-300 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
          <p className="text-gray-600 text-sm font-medium">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Rs {totalBudget}</p>
        </div>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-[90%]">
          <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-red-50 to-yellow-50">
            <p className="text-gray-600 text-sm font-medium">Spent This Month</p>
            <p className="text-lg font-bold text-red-600 mt-1">Rs {totalExpense}</p>
          </div>
          <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-green-50 to-teal-50">
            <p className="text-gray-600 text-sm font-medium">Budget Left</p>
            <p className="text-lg font-bold text-green-600 mt-1">{Math.round(percentageBudget) == "-Infinity" ? "Nil" : Math.round(percentageBudget)} %</p>
          </div>
        </div>
      </div>

      <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
        <div className="flex items-center justify-between">
          {/* Doughnut Chart */}
          <div className="w-[300px] md:w-[400px] p-4 ">
            <Doughnut data={doughnutData} />
            <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Doughnut chart </p>
          </div>
          {/* Bar Chart */}
          <div className="w-[400px] md:w-[800px] p-4">
            <Bar data={barData} />
            <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Bar chart </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
        </div>
        <p className="text-gray-600 text-[15px] text-center font-medium">Weekly Spending Trend</p>
      </div>

      <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-gray-50 to-white">

        <div className="flex items-center justify-between text-center">
          <p className="text-gray-900 font-semibold ">Recent Transactions</p>
          <button
            onClick={() => navigate("/dashboard/expense")}
            className="px-6 py-2 text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-400 transition-all"
          >
            See More
          </button>
        </div>

        <hr className="text-current/20 my-3 shadow shadow-current/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {transactions.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 ${item.type === "income" ? "bg-green-50" : "bg-red-50"} relative group`}
            >
              {/* Left side: Name, Type, Date */}
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-gray-900 capitalize">{item.categories}</p>
              </div>

              <div>
                <p className="text-[12px] text-gray-900 capitalize font-medium">{item.date}</p>
              </div>

              {/* Right side: Amount and Delete Button */}
              <div className="flex items-center space-x-3">
                {/* Delete Button - Only visible on hover */}
                <button
                  onClick={() => handleDelete(item.id, item.type)}
                  className="font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500 hover:shadow-md hover:bg-gray-100 px-2 py-2 rounded-2xl transition-all"
                >

                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                      <path strokeDasharray={24} strokeDashoffset={24} d="M12 20h5c0.5 0 1 -0.5 1 -1v-14M12 20h-5c-0.5 0 -1 -0.5 -1 -1v-14">
                        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0"></animate>
                      </path>
                      <path strokeDasharray={20} strokeDashoffset={20} d="M4 5h16">
                        <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.2s" values="20;0"></animate>
                      </path>
                      <path strokeDasharray={8} strokeDashoffset={8} d="M10 4h4M10 9v7M14 9v7">
                        <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"></animate>
                      </path>
                    </g>
                  </svg>

                </button>

                <span className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`} >
                  Rs. {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer />

    </section>
  );
}
