import { useState, useEffect, useMemo } from "react";
import VerticalNavbar from "./VerticalNavbar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Button components
import DeleteButton from "../../components/buttons/DeleteButton";
import EditButton from "../../components/buttons/EditButton";
import TransactionModal from "../../components/modals/TransactionModal"
import DeleteModal from "../../components/modals/DeleteModal"

// Warning
import Warning from "../../components/warning/Warning";
import WarningModal from "../../components/modals/WarningModal";

import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const createCenterTextPlugin = (centerText) => ({
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();

    const fontSize = Math.min(width, height) / 12;
    ctx.font = `bold ${Math.floor(fontSize)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';

    ctx.fillText(centerText || '', width / 2, height / 1.9);

    ctx.restore();
  }
});

export default function Expense() {
  /* INFO: useStates */
  // Remove these unused state variables:
  // const [description, setDescription] = useState("");
  // const [categories, setCategories] = useState("");
  // const [amount, setAmount] = useState("");
  // const [date, setDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Pop-up form / modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit Expense Modal
  const [selectedExpense, setSelectedExpense] = useState(null); // Track the selected expense details for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pop-up form / modal
  const [refreshKey, setRefreshKey] = useState(0); // Used for forcing component re-render
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected transaction ID for deletion
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  // Define transactions state HERE, before it's used
  const [transactions, setTransactions] = useState([]);

  const [drilldown, setDrilldown] = useState({
    level: 'category',     // or 'subcategory'
    parentCategory: null   // e.g., "Food"
  });


  const navigate = useNavigate();

  const [doughnutData, setDoughnutData] = useState({
    labels: [],
    datasets: []
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  });

  // const today = new Date().toISOString().split('T')[0];

  // Handle Editing Expense
  const handleEditSubmit = async (values) => {
    toast.loading("Updating Expense...");
    const { amount, categories, subcategories, date } = values;

    const expenseData = {
      amount: parseFloat(amount),
      categories,
      subcategories,
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
    const { amount, categories, subcategories, date } = values;

    /* Make sure form is filled */
    if (!amount || !categories || !date) {
      toast.dismiss();
      toast.warn("Please Fill in all fields")
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      categories,
      subcategories,
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


  // NOTE: data for doughnut chart
  const categoryColors = {
    "Food & Dining": "#ffcc00", // Yellow
    "Housing": "#ff5722", // Orange
    "Transportation": "#ffc0cb", // Light Pink
    "Vehicle": "#8e44ad", // Purple
    "Entertainment": "#2196f3", // Blue
    "Shopping": "#9c27b0", // Purple
    "Communication, PC": "#00bcd4", // Cyan
    "Health & Wellness": "#4caf50", // Green
    "Personal Care": "#f44336", // Red
    "Education": "#3f51b5", // Indigo
    "Travel": "#ff9800", // Amber
    "Investments": "#607d8b", // Blue Grey
    "Business": "#673ab7", // Deep
    "Others": "#f44336", // Red
  };
  const subcategoryColorPalette = [
    "#FF6384", // red
    "#36A2EB", // blue
    "#FFCE56", // yellow
    "#4BC0C0", // teal
    "#9966FF", // purple
    "#FF9F40", // orange
    "#8AC926", // green
    "#F74F8D", // pink
    "#1E88E5", // vivid blue
    "#FFD662", // gold
    "#00C853", // bright green
    "#AA66CC", // lavender
    "#FF7043", // warm orange
    "#26C6DA", // sky blue
    "#7E57C2", // deep purple
  ];

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
  }, [refreshKey]); // Or consider using a more specific dependency like an auth token change

  useEffect(() => {
    if (!transactions) return; // Add this check to prevent errors if transactions is still null/undefined initially

    const expenses = transactions
      .filter(t => t.type === "expense")
      .map(t => ({
        ...t,
        amount: Number(t.amount),
        category: t.categories || "Uncategorized",
        subcategory: t.subcategories || "Other"
      }));

    let labels = [];
    let data = [];
    let backgroundColor = [];

    if (drilldown.level === 'category') {
      // Group by main category
      const grouped = {};
      expenses.forEach(e => {
        grouped[e.category] = (grouped[e.category] || 0) + e.amount;
      });
      labels = Object.keys(grouped);
      data = Object.values(grouped);
      backgroundColor = labels.map(cat => categoryColors[cat] || "#cccccc");

    } else if (drilldown.level === 'subcategory') {
      // Group by subcategory under selected parent
      const filtered = expenses.filter(e => e.category === drilldown.parentCategory);
      const grouped = {};
      filtered.forEach(e => {
        grouped[e.subcategory] = (grouped[e.subcategory] || 0) + e.amount;
      });
      labels = Object.keys(grouped);
      data = Object.values(grouped);
      // Use parent category color as base, or subcategory if defined
      backgroundColor = labels.map((_, index) =>
        subcategoryColorPalette[index % subcategoryColorPalette.length] ||
        categoryColors[drilldown.parentCategory] ||
        "#cccccc"
      );
    }

    setDoughnutData({
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 1,
      }]
    });
  }, [transactions, drilldown]);

  // INFO: Data for line chart
  // Get last 7 days
  useEffect(() => {
    if (!transactions) return; // Add this check for safety

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


  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Compute center text
  // In your component
  const centerText = drilldown.level === 'category'
    ? ` Rs ${totalExpense.toFixed(2)} `
    : drilldown.parentCategory || '';

  // Get plugin instance
  const centerTextPlugin = useMemo(() => createCenterTextPlugin(centerText), [centerText]);

  const totalBudget = totalIncome - totalExpense;

  const handleAddExpenseClick = () => {
    if (totalBudget < 0) {
      // Show warning modal if budget is negative
      setIsWarningOpen(true);
    } else {
      // Directly open expense modal if budget is positive
      setIsModalOpen(true);
    }
  };

  const handleAddIncome = () => {
    setIsWarningOpen(false);
    // Redirect to income section or open income modal
    navigate("/dashboard/income"); // or handle income modal differently
  };

  const handleContinueExpense = () => {
    setIsWarningOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className={`2xl:ml-64 lg:ml-28 bg-blue-50 gap-y-6 flex flex-col ${`h-screen` ? `h-screen` : `h-full`} `}>
          <Warning data={{ totalBudget, totalIncome, totalExpense }} />
          <div className={`flex items-center justify-center ${totalBudget >= 0 ? "mt-6" : ""}`}>
            <div className="border border-current/20 rounded-2xl w-[90%] sm:w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
              <div className="w-full flex flex-col items-center justify-between 2xl:flex 2xl:flex-row xl:flex xl:flex-row lg:flex md:flex md:flex-col sm:flex sm:flex-col">
                {/* Doughnut Chart */}
                <div className="w-[350px] p-4 2xl:w-[400px] xl:w-[100px] sm:w-[350px] md:w-[400px] flex-1 ">
                  <Doughnut
                    key={centerText}
                    data={doughnutData}
                    plugins={[centerTextPlugin]}
                    options={{
                      cutout: '70%',
                      onClick: (event, elements) => {
                        if (elements.length > 0) {
                          const index = elements[0].index;
                          const clickedLabel = doughnutData.labels[index];

                          if (drilldown.level === 'category') {
                            // Drill down to subcategories
                            setDrilldown({
                              level: 'subcategory',
                              parentCategory: clickedLabel
                            });
                          }
                          // Optionally: ignore click on subcategory level (or go deeper if needed)
                        }
                      },
                      plugins: {
                        legend: { display: true },
                        tooltip: { enabled: true }
                      }
                    }}
                  />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Doughnut chart </p>
                </div>
                {/* Bar Chart */}
                <div className="w-[500px] 2xl:w-[700px] xl:w-[600px] lg:w-[700px] md:w-[600px] sm:w-[500px] p-4 lg:flex-2 flex-2 ">
                  <Line data={lineData} />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Bar chart </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
              </div>
              <p className="text-gray-600 text-[15px] text-center font-medium">Weekly Spending Trend</p>
              {drilldown.level === 'subcategory' && (
                <button
                  onClick={() => setDrilldown({ level: 'category', parentCategory: null })}
                  style={{ marginBottom: '1rem' }}
                  className="font-medium text-gray-600 mt-5 hover:text-gray-800 cursor-pointer "
                >
                  ← Back to All Categories
                </button>
              )}
            </div>
          </div>

          {/* Reusable Delete Modal */}
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              handleDelete(selectedItemId); // Your existing delete function
              setIsDeleteModalOpen(false);
            }}
            itemName={
              transactions.find(t => t.id === selectedItemId)?.categories || "expense"
            }
            itemType="expense"
          />

          {/* Edit Expense Modal */}
          <TransactionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            initialValues={{
              amount: selectedExpense?.amount || '',
              categories: selectedExpense?.categories || '',
              subcategories: selectedExpense?.subcategories || '',
              date: selectedExpense?.date || ''
            }}
            modalType="edit"
            transactionType="expense"
          />

          {/* Modal - Add Expense Form */}
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            initialValues={{ amount: '', categories: '', subcategories: '', date: '' }}
            modalType="add"
            transactionType="expense"
          />
          <WarningModal
            isOpen={isWarningOpen}
            onClose={() => setIsWarningOpen(false)}
            onAddIncome={handleAddIncome}
            onContinueExpense={handleContinueExpense}
            totalBudget={totalBudget}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />

          <div className="w-full flex items-center justify-center">
            <div className="border border-current/20 rounded-2xl w-[90%] sm:w-[90%] p-4 bg-gradient-to-r from-gray-50 to-white mb-9">
              <div className="flex items-center justify-between text-center">
                <p className="text-gray-900 font-semibold ">Recent Expenses</p>

                <button
                  onClick={handleAddExpenseClick}
                  className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Expense
                </button>
              </div>
              <hr className="text-current/20 my-3 shadow shadow-current/20" />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {transactions
                  .filter((t) => t.type === 'expense') // This filter now works correctly
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 bg-red-50 group"
                    >
                      <div className="flex flex-1 items-center">
                        {/* Category */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 capitalize">
                            {item.categories}
                          </p>
                        </div>

                        {/* Date — fixed width like in your original */}
                        <div className="w-32">
                          <p className="text-[12px] text-gray-900 capitalize font-medium">
                            {item.date}
                          </p>
                        </div>

                        {/* Actions + Amount */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <EditButton
                            onClick={() => {
                              setSelectedExpense(item);
                              setSelectedItemId(item.id);
                              setIsEditModalOpen(true);
                            }}
                          />
                          <DeleteButton
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                          />
                          <span className="font-semibold min-w-[60px] text-right text-red-600">
                            Rs. {item.amount}
                          </span>
                        </div>
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
