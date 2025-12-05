import { saveAs } from "file-saver"
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

// Navbar (horizontal and vertical)
import VerticalNavbar from "./VerticalNavbar";
import HorizontalNavbar from "./HorizontalNavbar";

import EditButton from "../../components/buttons/EditButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import TransactionModal from "../../components/modals/TransactionModal"
import DeleteModal from "../../components/modals/DeleteModal";

import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Helper function to format dates based on time period
const formatDateLabel = (dateString, period) => {
  const date = new Date(dateString);

  switch (period) {
    case 'weekly':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case 'monthly':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'yearly':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Helper function to get date ranges based on time period
const getDateRange = (period) => {
  const ranges = [];

  switch (period) {
    case 'weekly':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ranges.push(d.toISOString().split("T")[0]);
      }
      break;

    case 'monthly':
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ranges.push(d.toISOString().split("T")[0]);
      }
      break;

    case 'yearly':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1); // First day of month for grouping
        ranges.push(d.toISOString().split("T")[0]);
      }
      break;

    default:
      // Default to weekly
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ranges.push(d.toISOString().split("T")[0]);
      }
  }

  return ranges;
};

// Helper function to group transactions by period for line chart
const groupTransactionsByPeriod = (transactions, dateRange, period) => {
  const groupedData = {};

  // Initialize all periods with 0
  dateRange.forEach(date => {
    const key = period === 'yearly'
      ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date;
    groupedData[key] = { income: 0, expense: 0 };
  });

  // Sum up transactions for each period
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    let periodKey;

    if (period === 'yearly') {
      // Group by month-year for yearly view
      periodKey = transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      // For weekly and monthly, use the exact date for grouping
      periodKey = transaction.date;
    }

    if (groupedData[periodKey]) {
      if (transaction.type === 'income') {
        groupedData[periodKey].income += Number(transaction.amount);
      } else {
        groupedData[periodKey].expense += Number(transaction.amount);
      }
    }
  });

  return groupedData;
};

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
  const [timePeriod, setTimePeriod] = useState('weekly'); // 'weekly', 'monthly', 'yearly'

  /* INFO: Report related variables */
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportFormat, setReportFormat] = useState('csv');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly'); // weekly, monthly, yearly, custom

  const [dateSelected1, setDateSelected1] = useState(false);
  const [dateSelected2, setDateSelected2] = useState(false);

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: []
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  });

  const [refreshKey, setRefreshKey] = useState(0); // Used for forcing component re-render

  // Time period options
  const timePeriods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return 'Last 7 Days';
      case 'monthly':
        return 'Last 30 Days';
      case 'yearly':
        return 'Last 12 Months';
      case 'custom':
        return 'Custom Range';
      default:
        return 'Last 7 Days';
    }
  };


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
      // Get the income data for the bar chart, sorted by date (most recent last - for right side)
      const incomeData = transactions
        .filter((t) => t.type === "income")
        .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date, oldest first (most recent will be on the right)
        .map((t) => ({
          inc_source: t.inc_source,
          amount: Number(t.amount),
          date: t.date, // Include date for sorting
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

  // INFO: Data for line chart - Updated to use time period
  useEffect(() => {
    const dateRange = getDateRange(timePeriod);
    const groupedData = groupTransactionsByPeriod(transactions, dateRange, timePeriod);

    const incomePerPeriod = dateRange.map(date => {
      const key = timePeriod === 'yearly'
        ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : date;
      return groupedData[key]?.income || 0;
    });

    const expensePerPeriod = dateRange.map(date => {
      const key = timePeriod === 'yearly'
        ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : date;
      return groupedData[key]?.expense || 0;
    });

    const lineLabels = dateRange.map(date => formatDateLabel(date, timePeriod));

    setLineData({
      labels: lineLabels,
      datasets: [
        {
          label: "Income",
          data: incomePerPeriod,
          borderColor: "#4ade80",
          backgroundColor: "rgba(74, 222, 128, 0.2)",
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: expensePerPeriod,
          borderColor: "#f87171",
          backgroundColor: "rgba(248, 113, 113, 0.2)",
          tension: 0.4,
        },
      ],
    });
  }, [transactions, timePeriod]);

  const filterIncomeByPeriod = (income) => {
    if (!income.length) return income;

    const filteredIncome = [...income];

    switch (selectedPeriod) {
      case 'weekly': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return filteredIncome.filter(income => new Date(income.date) >= cutoff);
      }

      case 'monthly': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return filteredIncome.filter(income => new Date(income.date) >= cutoff);
      }

      case 'yearly': {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        return filteredIncome.filter(income => new Date(income.date) >= cutoff);
      }

      case 'custom': {
        if (!customStartDate || !customEndDate) {
          toast.error('Please select both start and end dates');
          return [];
        }
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);

        return filteredIncome.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= start && incomeDate <= end;
        });
      }

      default:
        return filteredIncome;
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (income) => {
    if (!income.length) return 'No data';

    const headers = ['Source', 'Amount', 'Date'];
    const csvHeaders = headers.join(',');

    const csvRows = income.map(row => {
      const rowData = [
        row.inc_source,
        row.amount,
        row.date
      ];
      return rowData.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  // Helper function to convert data to XML
  const convertToXML = (income, format = 'xml') => {
    const totalAmount = income.reduce((sum, item) => sum + Number(item.amount), 0);

    return `<?xml version="1.0" encoding="UTF-8"?>
${format === 'xslt' ? '<?xml-stylesheet type="text/xsl" href="income-report.xsl"?>' : ''}
<IncomeReport>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
  <Summary>
    <TimePeriod>${getPeriodLabel()}</TimePeriod>
    ${selectedPeriod === 'custom' ? `<DateRange>${customStartDate} to ${customEndDate}</DateRange>` : ''}
    <TotalRecords>${income.length}</TotalRecords>
    <TotalAmount>${totalAmount.toFixed(2)}</TotalAmount>
    <BudgetSummary>
      <TotalIncome>${totalIncome.toFixed(2)}</TotalIncome>
      <TotalExpense>${totalExpense.toFixed(2)}</TotalExpense>
      <RemainingBudget>${totalBudget.toFixed(2)}</RemainingBudget>
    </BudgetSummary>
  </Summary>
  <Transactions>
    ${income.map(item => `
    <Transaction>
      <Source>${item.inc_source}</Source>
      <Amount>${item.amount}</Amount>
      <Date>${item.date}</Date>
    </Transaction>`).join('')}
  </Transactions>
</IncomeReport>`;
  };

  // Main download handler function
  const handleDownloadReport = async () => {
    if (selectedPeriod === 'custom' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates for custom range');
      return;
    }

    setIsDownloading(true);

    try {
      const allIncome = transactions.filter(t => t.type === 'income');
      const filteredIncome = filterIncomeByPeriod(allIncome);

      if (filteredIncome.length === 0) {
        toast.warning('No income data found for selected period');
        setIsDownloading(false);
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const periodLabel = selectedPeriod === 'custom' ? 'custom' : selectedPeriod;
      let content, filename, mimeType;

      switch (reportFormat) {
        case 'csv':
          content = convertToCSV(filteredIncome);
          filename = `income-report-${periodLabel}-${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8';
          break;

        case 'xml':
          content = convertToXML(filteredIncome, 'xml');
          filename = `income-report-${periodLabel}-${timestamp}.xml`;
          mimeType = 'application/xml;charset=utf-8';
          break;

        case 'xslt':
          content = convertToXML(filteredIncome, 'xslt');
          filename = `income-report-${periodLabel}-${timestamp}.xml`;
          mimeType = 'application/xml;charset=utf-8';
          break;

        default:
          content = convertToCSV(filteredIncome);
          filename = `income-report-${periodLabel}-${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8';
      }

      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, filename);

      toast.success(`Income report downloaded successfully`);
      setIsDownloadModalOpen(false);

      // Reset form
      setSelectedPeriod('weekly');
      setCustomStartDate('');
      setCustomEndDate('');
      setReportFormat('csv');

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate income report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed lg:w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className="block lg:hidden">
          <HorizontalNavbar />
        </div>

        <div className={`2xl:ml-64 lg:ml-28 gap-y-6 flex flex-col min-h-screen h-full`}>
          <div className="flex items-center justify-center mt-6">
            <div className="border border-current/20 rounded-2xl w-[90%] p-4 bg-linear-to-r from-indigo-50 to-purple-50">

              {/* Time Period Selector */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  {timePeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setTimePeriod(period.value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timePeriod === period.value
                        ? 'bg-linear-to-tr from-green-500 to-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:cursor-pointer hover:text-gray-700 hover:scale-105'
                        }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Bar Chart */}
                <div className="w-full lg:w-1/2 p-4">
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Income Sources'
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full">Income Sources</p>
                </div>

                {/* Line Chart */}
                <div className="w-full lg:w-1/2 p-4">
                  <Line
                    data={lineData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Income vs Expenses`
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full">
                    {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Trend
                  </p>
                </div>
              </div>

              <p className="text-gray-600 text-[15px] text-center font-medium">
                {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Financial Overview
              </p>
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
            <div className="border border-current/20 rounded-2xl w-[90%] p-4 bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between text-center">
                <p className="text-gray-900 font-semibold">Recent Income</p>

                <div className="flex items-center gap-3">
                  {/* Download Report Modal */}
                  {isDownloadModalOpen && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50 backdrop-blur-sm">

                      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-extrabold text-gray-700">Download Income Report</h2>

                          <button
                            onClick={() => setIsDownloadModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-4xl cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>

                        {/* Period Selection */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-600 mb-3">Select Time Period</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setSelectedPeriod('weekly')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'weekly'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 7 Days</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('monthly')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'monthly'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 30 Days</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('yearly')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'yearly'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 12 Months</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('custom')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'custom'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Custom Range</span>
                            </button>
                          </div>
                        </div>

                        {/* Custom Date Inputs */}
                        {selectedPeriod === 'custom' && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-600 mb-3">Select Custom Dates</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onSelect={() => setDateSelected1(true)}
                                  onBlur={() => setDateSelected1(false)}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:text-gray-800 ${dateSelected1 ? 'text-gray-800' : 'text-gray-600'
                                    }`}
                                  max={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  onMouseOver={() => setDateSelected2(true)}
                                  onMouseOut={() => setDateSelected2(false)}
                                  min={customStartDate}
                                  max={new Date().toISOString().split('T')[0]}
                                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:text-gray-800 ${dateSelected2 ? 'text-gray-800' : 'text-gray-600'
                                    }`}
                                />
                              </div>
                              {customStartDate && customEndDate && (
                                <div className="text-sm text-gray-600">
                                  Selected: {customStartDate} to {customEndDate}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Format Selection */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-600 mb-3">Select Format</h3>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => setReportFormat('csv')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${reportFormat === 'csv'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="font-medium text-gray-700">CSV</div>
                              <div className="text-xs mt-1 text-gray-500">Excel</div>
                            </button>
                            <button
                              onClick={() => setReportFormat('xml')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${reportFormat === 'xml'
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="font-medium text-gray-700">XML</div>
                              <div className="text-xs mt-1 text-gray-500">Data</div>
                            </button>
                            <button
                              onClick={() => setReportFormat('xslt')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${reportFormat === 'xslt'
                                ? 'border-purple-500 bg-purple-50 text-purple-600'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="font-medium text-gray-700">XSLT</div>
                              <div className="text-xs mt-1 text-gray-500">Styled</div>
                            </button>
                          </div>
                        </div>

                        {/* Summary Info */}
                        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                          <h3 className="font-semibold text-green-700 mb-2">Report Summary</h3>
                          <div className="text-sm text-green-600">
                            <div>• Will include all income transactions</div>
                            <div>• Filtered by {getPeriodLabel()}</div>
                            <div>• Downloaded as {reportFormat.toUpperCase()} file</div>
                            {selectedPeriod === 'custom' && customStartDate && customEndDate && (
                              <div>• Date range: {customStartDate} to {customEndDate}</div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setIsDownloadModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer border border-gray-300 shadow-sm hover:scale-102"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDownloadReport}
                            disabled={isDownloading || (selectedPeriod === 'custom' && (!customStartDate || !customEndDate))}
                            className="flex-1 px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group hover:scale-102"
                          >
                            {isDownloading ? (
                              <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 transition duration-300 group-hover:rotate-12 group-hover:scale-120" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"></path>
                                </svg>
                                Download Report
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Download Reports Button */}
                  <div className="flex items-center gap-2 mr-4">
                    <button
                      onClick={() => setIsDownloadModalOpen(true)}
                      className="px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group hover:scale-102"
                    >
                      <svg className="w-5 h-5 transition duration-300 group-hover:rotate-12 group-hover:scale-120" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"></path>
                      </svg>
                      Download Report
                    </button>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group hover:scale-102"
                  >
                    <svg className="w-5 h-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Add Income
                  </button>
                </div>
              </div>

              <hr className="text-current/20 my-3 shadow shadow-current/20" />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {transactions
                  .filter((t) => t.type === 'income')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center py-2.5 border-b border-gray-200 last:border-0 shadow shadow-current/10 rounded-2xl p-4 bg-green-50 group"
                    >
                      <div className="flex flex-1 items-center">
                        {/* Income Source */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 capitalize">
                            {item.inc_source}
                          </p>
                        </div>

                        {/* Date — fixed width to align with expense/date column */}
                        <div className="w-32">
                          <p className="text-[12px] text-gray-900 capitalize font-medium">
                            {item.date}
                          </p>
                        </div>

                        {/* Actions + Amount */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <EditButton
                            onClick={() => {
                              setSelectedIncome(item);
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
                          <span className="font-semibold min-w-[60px] text-right text-green-600">
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
      </div >
    </>
  );
}
