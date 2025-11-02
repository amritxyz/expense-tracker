import { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Recent() {
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
    <section className="flex flex-col items-center space-y-6">
      {/* Doughnut Chart */}
      <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
        <div className="flex items-center justify-between">
          <div className="w-[300px] md:w-[400px] p-4 ">
            <Doughnut data={doughnutData} />
            <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Doughnut chart </p>
          </div>
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
        <p className="text-gray-900 font-semibold mb-3">Recent Transactions</p>

        <div className="space-y-3">
          {transactions.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0 rounded-2xl p-4 ${item.type === "income" ? "bg-green-50" : "bg-red-50"
                }`}
            >
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {item.name || item.exp_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
              </div>

              <div>
                <p className="text-xs text-gray-900 capitalize">{item.date}</p>
              </div>

              <span
                className={`font-semibold ${item.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
