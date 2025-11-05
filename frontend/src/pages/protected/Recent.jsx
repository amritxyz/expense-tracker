import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// components and modals
import TransactionModal from "../../components/modals/TransactionModal";
import DeleteModal from "../../components/modals/DeleteModal";
import DeleteButton from "../../components/buttons/DeleteButton";
import EditButton from "../../components/buttons/EditButton";

// Warning
import Warning from "../../components/warning/Warning"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Recent() {
  const [transactions, setTransactions] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected transaction ID for deletion
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Track the selected transaction details for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit Modal
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedItem = transactions.find(t => t.id === selectedItemId);

  const navigate = useNavigate();

  async function handleDelete(id, type) {
    toast.loading("Deleting...");
    if (!type || (type !== "income" && type !== "expense")) {
      toast.error("Invalid transaction type");
      return;
    }
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.dismiss();
        toast.error("No token found. Please log in.");
        return; // Exit if there's no token
      }

      const endPoint = type === "income" ? `http://localhost:5000/income/${id}` : `http://localhost:5000/expenses/${id}`;

      const response = await fetch(endPoint, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        toast.dismiss();
        toast.success("Transaction deleted successfully.");
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );
        setIsDeleteModalOpen(false); // Close modal after deleting
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete the transaction.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("An error occurred while deleting the transaction.");
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

  // Chart data for doughnut chart
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

  // Bar chart data for weekly spending trend
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

  const handleEditSubmit = async (values) => {
    if (!selectedTransaction) return;

    toast.loading("Updating Transaction...");

    try {
      const token = localStorage.getItem("token");

      // Determine if it's income or expense
      const isIncome = selectedTransaction.type === "income";
      const endPoint = isIncome
        ? `http://localhost:5000/income/${selectedItemId}`
        : `http://localhost:5000/expenses/${selectedItemId}`;

      // Prepare the data based on transaction type
      let updateData;
      if (isIncome) {
        updateData = {
          inc_source: values.inc_source,
          amount: parseFloat(values.amount),
          date: values.date
        };
      } else {
        updateData = {
          amount: parseFloat(values.amount),
          categories: values.categories,
          description: values.description,
          date: values.date
        };
      }

      const response = await fetch(endPoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (response.ok) {
        setIsEditModalOpen(false);
        toast.dismiss();
        toast.success(`${selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)} updated successfully.`);

        // Update the transactions state with the new data
        setTransactions((prevTransactions) =>
          prevTransactions.map((item) =>
            item.id === selectedItemId ? { ...item, ...updateData } : item
          )
        );
        setRefreshKey((prevKey) => prevKey + 1); // Trigger re-render
      } else {
        toast.dismiss();
        toast.error(data.message || `Failed to update the ${selectedTransaction.type}.`);
      }
    } catch (err) {
      toast.dismiss();
      console.log(`Error updating ${selectedTransaction.type}:`, err);
      toast.error(`An error occurred while updating the ${selectedTransaction.type}.`);
    }
  };

  // Separate functions for opening edit modal
  const openEditModal = (item) => {
    setSelectedTransaction(item);
    setSelectedItemId(item.id);
    setIsEditModalOpen(true);
  };

  return (
    <section className="flex flex-col items-center space-y-6 ">
      <Warning data={{ totalBudget, totalIncome, totalExpense }} />

      {/* Available Balance */}
      <div className={`w-full flex items-center justify-center ${totalBudget >= 0 ? "mt-6" : ""} `}>
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
            <p className="text-lg font-bold text-green-600 mt-1">
              {isNaN(percentageBudget) ? "Nil" : Math.round(percentageBudget)} %
            </p>
          </div>
        </div>
      </div>

      {/* Doughnut and Bar Charts */}
      <div className="border border-current/20 rounded-2xl w-[90%] p-4 bg-gradient-to-r from-indigo-50 to-purple-50 ">
        <div className="2xl:flex 2xl:flex-row xl:flex xl:flex-row sm:flex sm:flex-col flex flex-col items-center justify-between xl:flex-1 lg:flex lg:flex-col lg:flex-1">
          {/* Doughnut Chart */}
          <div className="w-[300px] 2xl:w-[350px] xl:w-[360px] xl:flex-1 lg:w-[400px] p-4 2xl:flex-1 3xl:flex-1">
            <Doughnut data={doughnutData} />
            <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Doughnut chart </p>
          </div>
          {/* Bar Chart */}
          <div className="w-[500px] 2xl:w-[800px] xl:w-[650px] xl:flex-2 lg:w-[800px] sm:w-[600px] p-4 2xl:flex-2 3xl:flex-1">
            <Bar data={barData} />
            <p className="text-gray-600 text-xs text-center font-medium w-full h-full "> Bar chart </p>
          </div>
        </div>
        <p className="text-gray-600 text-[15px] text-center font-medium">Weekly Spending Trend</p>
      </div>

      {/* Recent Transactions */}
      <div className="border border-current/20 rounded-2xl w-[90%] p-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between text-center">
          <p className="text-gray-900 font-semibold ">Recent Transactions</p>
          <button
            onClick={() => navigate("/dashboard/expense")}
            className="px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-x-1 group cursor-pointer"
          >
            See More
            <svg
              className="transition-transform transform group-hover:translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="m16.172 11l-5.364-5.364l1.414-1.414L20 12l-7.778 7.778l-1.414-1.414L16.172 13H4v-2z"></path>
            </svg>
          </button>
        </div>

        <hr className="text-current/20 my-3 shadow shadow-current/20" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {transactions.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 ${item.type === "income" ? "bg-green-50" : "bg-red-50"} group`}
            >
              {/* Transaction Info Section */}
              <div className="flex flex-1 items-center">
                {/* Transaction Description */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">
                    {item.type === 'income' ? item.inc_source : item.categories}
                  </p>
                </div>

                {/* Transaction Date */}
                <div className="w-32">
                  <p className="text-[12px] text-gray-900 capitalize font-medium">{item.date}</p>
                </div>

                {/* Right: Buttons + Amount */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <EditButton onClick={() => openEditModal(item)} />
                  <DeleteButton
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                  <span className={`font-semibold min-w-[60px] text-right ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`} >
                    Rs. {item.amount}
                  </span>
                </div>

              </div>

              {/* Action Buttons Section (Edit & Delete) */}
            </div>
          ))}
        </div>

        {/* Edit Modal - Single modal for both income and expense */}
        <TransactionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          initialValues={
            selectedTransaction?.type === "income"
              ? {
                inc_source: selectedTransaction?.inc_source || '',
                amount: selectedTransaction?.amount || '',
                date: selectedTransaction?.date || ''
              }
              : {
                amount: selectedTransaction?.amount || '',
                categories: selectedTransaction?.categories || '',
                description: selectedTransaction?.description || '',
                date: selectedTransaction?.date || ''
              }
          }
          modalType="edit"
          transactionType={selectedTransaction?.type || "expense"}
        />

        {/* Modal - Delete modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            handleDelete(selectedItemId, selectedItem?.type);
            setIsDeleteModalOpen(false);
          }}
          itemName={
            selectedItem
              ? selectedItem.type === 'income'
                ? selectedItem.inc_source
                : selectedItem.categories
              : 'this item'
          }
          itemType={selectedItem?.type || 'transaction'}
        />

      </div>
      <ToastContainer />
    </section>
  );
}
