import { useState, useEffect } from "react";
import VerticalNavbar from "./VerticalNavbar";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import EditButton from "../../components/buttons/EditButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import TransactionModal from "../../components/modals/TransactionModal"
import DeleteModal from "../../components/modals/DeleteModal";

import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Income() {
  const [inc_source, setInc_source] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Pop-up form / modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pop-up form / modal
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected transaction ID for deletion

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: []
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  });

  const [refreshKey, setRefreshKey] = useState(0); // Used for forcing component re-render

  const handleEditSubmit = async (values) => {
    toast.loading("Updating income...");
    const { inc_source, amount, date } = values;

    const incomeData = {
      inc_source,
      amount: parseFloat(amount),
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/income/${selectedItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(incomeData),
      });

      const data = await response.json();
      if (response.ok) {
        setIsEditModalOpen(false);
        toast.dismiss();
        toast.success("Income updated successfully.");

        // Update local state
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === selectedItemId ? { ...item, ...incomeData } : item
          )
        );
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update income.");
      }
    } catch (err) {
      toast.dismiss();
      console.log("Edit error:", err);
      toast.error("Error updating income.");
    }
  };

  async function handleSubmit(values) {
    toast.loading("Adding income");
    const { inc_source, amount, date } = values;

    if (!inc_source || !amount || !date) {
      toast.dismiss();
      toast.warn("Please Fill in all fields");
      return;
    }

    const incomeData = { inc_source, amount: parseFloat(amount), date };

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
        setIsModalOpen(false);
        toast.dismiss();
        toast.success("Income added successfully.");
        setInc_source("");
        setAmount("");
        setDate("");

        const newIncome = { ...incomeData, type: "income", id: data.id };
        setTransactions((prevTransactions) => [newIncome, ...prevTransactions]);

        // Force re-render of charts and table
        setRefreshKey((prevKey) => prevKey + 1); // Change the key to trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message, "Failed to add income.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("An error occurred while adding the income.");
    }
  }

  async function handleDelete(id) {
    toast.loading("Deleting income...");
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/income/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        toast.dismiss();
        toast.success("Income deleted successfully.");
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );

        // Force re-render after deleting
        setRefreshKey((prevKey) => prevKey + 1); // Change the key to trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete the income.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("An error occurred while deleting the income.");
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
  }, [refreshKey]); // Re-fetch data when `refreshKey` changes

  useEffect(() => {
    if (transactions.length > 0) {
      // Get the income data for the bar chart
      const incomeData = transactions
        .filter((t) => t.type === "income")
        .map((t) => ({
          inc_source: t.inc_source,
          amount: Number(t.amount),
        }));

      const allIncomeNames = incomeData.map((e) => e.inc_source);
      const allIncomeAmounts = incomeData.map((e) => e.amount);

      setBarChartData({
        labels: allIncomeNames,
        datasets: [
          {
            label: "Income Amount",
            data: allIncomeAmounts,
            backgroundColor: "#4ade80", // Green color for the bars
            borderColor: "#388e3c",     // Darker green for borders
            borderWidth: 1,
          },
        ],
      });
    }
  }, [transactions]); // Re-run when transactions change

  // INFO: Data for line chart
  useEffect(() => {
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

        <div className={`md:ml-64 bg-blue-50 gap-y-6 flex flex-col ${`h-screen` ? `h-screen` : `h-full`}`}>
          <div className="flex items-center justify-center mt-6">
            <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
              <div className="w-full flex items-center justify-between">
                {/* Bar Chart */}
                <div className="w-[400px] md:w-[700px] p-4 ">
                  <Bar data={barChartData} />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Bar chart </p>
                </div>

                {/* Line Chart */}
                <div className="w-[400px] md:w-[700px] p-4">
                  <Line data={lineData} />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Line chart </p>
                </div>
              </div>
              <p className="text-gray-600 text-[15px] text-center font-medium">Weekly Spending Trend</p>
            </div>
          </div>

          {/* Modal - Add Income Form */}
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            initialValues={{ inc_source: '', amount: '', date: '' }}
            modalType="add"
            transactionType="income"
          />

          {/* Edit Income Modal */}
          <TransactionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            initialValues={{
              inc_source: selectedIncome?.inc_source || '',
              amount: selectedIncome?.amount || '',
              date: selectedIncome?.date || ''
            }}
            modalType="edit"
            transactionType="income"
          />

          {/* Modal - Delete modal */}
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              handleDelete(selectedItemId);
              setIsDeleteModalOpen(false);
            }}
            itemName={
              transactions.find(t => t.id === selectedItemId)?.inc_source || "income"
            }
            itemType="income"
          />

          <div className="w-full flex items-center justify-center ">
            <div className="border border-current/20 rounded-2xl md:w-[90%] p-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between text-center">
                <p className="text-gray-900 font-semibold ">Recent Income</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-all cursor-pointer flex"
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"></path>
                  </svg>
                  Add Income
                </button>
              </div>

              <hr className="text-current/20 my-3 shadow shadow-current/20" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {transactions.filter((t) => t.type == "income").map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 ${item.type === "income" ? "bg-green-50" : "bg-red-50"} relative group`}
                  >
                    {/* Left side: Name, Type, Date */}
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-gray-900 capitalize">{item.inc_source}</p>
                    </div>

                    <div>
                      <p className="text-[12px] text-gray-900 capitalize font-medium">{item.date}</p>
                    </div>

                    {/* Right side: Amount and Delete Button */}
                    <div className="flex items-center space-x-3">

                      <EditButton
                        onClick={() => {
                          setSelectedIncome(item);
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
      </div >
    </>
  );
}
