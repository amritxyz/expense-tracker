import { saveAs } from "file-saver";
import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Navbar (horizontal and vertical)
import VerticalNavbar from "./VerticalNavbar";
import HorizontalNavbar from "./HorizontalNavbar";

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
    const { ctx, chartArea, width, height } = chart;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();

    const fontSize = Math.min(width, height) / 14;
    ctx.font = `bold ${Math.floor(fontSize)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    let newCenterText = centerText.split("\n");
    const lineHeight = fontSize * 1.2;

    newCenterText.forEach((line, index) => {
      ctx.fillText(line, centerX, centerY - (newCenterText.length - 1) * lineHeight / 2 + index * lineHeight);
    });

    ctx.restore();
  }
});

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

export default function Expense() {
  /* INFO: useStates */
  const [isModalOpen, setIsModalOpen] = useState(false); // Pop-up form / modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit Expense Modal
  const [selectedExpense, setSelectedExpense] = useState(null); // Track the selected expense details for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pop-up form / modal
  const [refreshKey, setRefreshKey] = useState(0); // Used for forcing component re-render
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected transaction ID for deletion
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [hellCenterText, setCenterText] = useState("");
  const [pendingExpense, setPendingExpense] = useState("");
  const [timePeriod, setTimePeriod] = useState('weekly'); // 'weekly', 'monthly', 'yearly'
  /* INFO: Report related variables */
  // Add these state variables
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportFormat, setReportFormat] = useState('csv');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly'); // weekly, monthly, yearly, custom

  const [dateSelected1, setDateSelected1] = useState(false);
  const [dateSelected2, setDateSelected2] = useState(false);

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

  // Time period options
  const timePeriods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

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

  async function handleExpenseSubmit(values) {
    const expenseAmount = parseFloat(values.amount);

    if (totalIncome - (totalExpense + expenseAmount) < 0) {
      setPendingExpense(values);
      setIsWarningOpen(true);
    } else {
      await handleSubmit(values);
    }
  };

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
  }, [refreshKey]);

  useEffect(() => {
    if (!transactions) return;

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
    if (drilldown.level === 'subcategory') {
      const totalSubcategoryExpense = data.reduce((sum, currentValue) => sum + currentValue, 0);
      const centerText = `${drilldown.parentCategory}\n Rs ${totalSubcategoryExpense.toFixed(2)}`;
      setCenterText(centerText);
    }
  }, [transactions, drilldown]);

  // INFO: Data for line chart - Updated to use time period
  useEffect(() => {
    if (!transactions) return;

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

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Compute center text
  const centerText = drilldown.level === 'category'
    ? `Total Expense\nRs ${totalExpense.toFixed(2)} `
    : `${hellCenterText}` || '';

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
    navigate("/dashboard/income");
  };

  const handleContinueExpense = () => {
    setIsWarningOpen(false);
    setIsModalOpen(true);
    if (pendingExpense) {
      handleSubmit(pendingExpense);
      setPendingExpense(null);
    }
  };

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

  const filterExpensesByPeriod = (expenses) => {
    if (!expenses.length) return expenses;

    const filteredExpenses = [...expenses];

    switch (selectedPeriod) {
      case 'weekly': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return filteredExpenses.filter(expense => new Date(expense.date) >= cutoff);
      }

      case 'monthly': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return filteredExpenses.filter(expense => new Date(expense.date) >= cutoff);
      }

      case 'yearly': {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        return filteredExpenses.filter(expense => new Date(expense.date) >= cutoff);
      }

      case 'custom': {
        if (!customStartDate || !customEndDate) {
          toast.error('Please select both start and end dates');
          return [];
        }
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);

        return filteredExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      }

      default:
        return filteredExpenses;
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (expenses) => {
    if (!expenses.length) return 'No data';

    const headers = ['Category', 'Subcategory', 'Amount', 'Date'];
    const csvHeaders = headers.join(',');

    const csvRows = expenses.map(row => {
      const rowData = [
        row.categories,
        row.subcategories || 'N/A',
        row.amount,
        row.date
      ];
      return rowData.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  // Helper function to convert data to XML
  const convertToXML = (expenses, format = 'xml') => {
    const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return `<?xml version="1.0" encoding="UTF-8"?>
${format === 'xslt' ? '<?xml-stylesheet type="text/xsl" href="expense-report.xsl"?>' : ''}
<ExpenseReport>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
  <Summary>
    <TimePeriod>${getPeriodLabel()}</TimePeriod>
    ${selectedPeriod === 'custom' ? `<DateRange>${customStartDate} to ${customEndDate}</DateRange>` : ''}
    <TotalRecords>${expenses.length}</TotalRecords>
    <TotalAmount>${totalAmount.toFixed(2)}</TotalAmount>
    <BudgetSummary>
      <TotalIncome>${totalIncome.toFixed(2)}</TotalIncome>
      <TotalExpense>${totalExpense.toFixed(2)}</TotalExpense>
      <RemainingBudget>${totalBudget.toFixed(2)}</RemainingBudget>
    </BudgetSummary>
  </Summary>
  <Transactions>
    ${expenses.map(item => `
    <Transaction>
      <Category>${item.categories}</Category>
      <Subcategory>${item.subcategories || 'N/A'}</Subcategory>
      <Amount>${item.amount}</Amount>
      <Date>${item.date}</Date>
    </Transaction>`).join('')}
  </Transactions>
</ExpenseReport>`;
  };

  const getFilteredExpenseData = () => {
    let filteredExpenses = transactions.filter(t => t.type === 'expense');

    // Apply date filtering
    if (isCustomMode && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);

      filteredExpenses = filteredExpenses.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= start && txDate <= end;
      });
    } else {
      // Default: recent period based on timePeriod
      const daysBack = reportTimePeriod === 'weekly' ? 7 : reportTimePeriod === 'monthly' ? 30 : 365;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);

      filteredExpenses = filteredExpenses.filter(t => new Date(t.date) >= cutoff);
    }

    return {
      transactions: filteredExpenses,
      periodType: isCustomMode ? 'custom' : reportTimePeriod,
      dateRangeText: isCustomMode
        ? `${customStartDate} to ${customEndDate}`
        : reportTimePeriod === 'weekly'
          ? 'Last 7 Days'
          : reportTimePeriod === 'monthly'
            ? 'Last 30 Days'
            : 'Last 12 Months'
    };
  };

  // Main download handler function
  const handleDownloadReport = async () => {
    if (selectedPeriod === 'custom' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates for custom range');
      return;
    }

    setIsDownloading(true);

    try {
      const allExpenses = transactions.filter(t => t.type === 'expense');
      const filteredExpenses = filterExpensesByPeriod(allExpenses);

      if (filteredExpenses.length === 0) {
        toast.warning('No expense data found for selected period');
        setIsDownloading(false);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const periodLabel = selectedPeriod === 'custom' ? 'custom' : selectedPeriod;
      let content, filename, mimeType;

      switch (reportFormat) {
        case 'csv':
          content = convertToCSV(filteredExpenses);
          filename = `expense-report-${periodLabel}-${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8';
          break;

        case 'xml':
          content = convertToXML(filteredExpenses, 'xml');
          filename = `expense-report-${periodLabel}-${timestamp}.xml`;
          mimeType = 'application/xml;charset=utf-8';
          break;

        case 'xslt':
          content = convertToXML(filteredExpenses, 'xslt');
          filename = `expense-report-${periodLabel}-${timestamp}.xml`;
          mimeType = 'application/xml;charset=utf-8';
          break;

        default:
          content = convertToCSV(filteredExpenses);
          filename = `expense-report-${periodLabel}-${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8';
      }

      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, filename);

      toast.success(`Expense report downloaded successfully`);
      setIsDownloadModalOpen(false);

      // Reset form
      setSelectedPeriod('weekly');
      setCustomStartDate('');
      setCustomEndDate('');
      setReportFormat('csv');

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate expense report');
    } finally {
      setIsDownloading(false);
    }
  };

  // Optional: XSLT stylesheet download for expense reports
  const downloadXSLTStylesheet = () => {
    const xsltContent = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8fafc; }
          .container { max-width: 1200px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
          .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .card.income { border-left: 4px solid #4ade80; }
          .card.expense { border-left: 4px solid #ef4444; }
          .card.budget { border-left: 4px solid #3b82f6; }
          .card-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .card.income .card-value { color: #4ade80; }
          .card.expense .card-value { color: #ef4444; }
          .card.budget .card-value { color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #ef4444; color: white; font-weight: 600; }
          tr:nth-child(even) { background-color: #f8fafc; }
          tr:hover { background-color: #fef2f2; }
          .category-badge { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
          .amount { font-weight: 600; }
          .positive { color: #4ade80; }
          .negative { color: #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Expense Report</h1>
            <p>Generated on: <xsl:value-of select="ExpenseReport/GeneratedAt"/></p>
          </div>

          <div class="summary-cards">
            <div class="card income">
              <h3>Total Income</h3>
              <div class="card-value">Rs. <xsl:value-of select="format-number(ExpenseReport/BudgetStatus/TotalIncome, '#,##0.00')"/></div>
            </div>
            <div class="card expense">
              <h3>Total Expense</h3>
              <div class="card-value">Rs. <xsl:value-of select="format-number(ExpenseReport/BudgetStatus/TotalExpense, '#,##0.00')"/></div>
            </div>
            <div class="card budget">
              <h3>Remaining Budget</h3>
              <div class="card-value">
                <xsl:choose>
                  <xsl:when test="ExpenseReport/BudgetStatus/RemainingBudget >= 0">
                    <span class="positive">Rs. <xsl:value-of select="format-number(ExpenseReport/BudgetStatus/RemainingBudget, '#,##0.00')"/></span>
                  </xsl:when>
                  <xsl:otherwise>
                    <span class="negative">-Rs. <xsl:value-of select="format-number(-ExpenseReport/BudgetStatus/RemainingBudget, '#,##0.00')"/></span>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
            </div>
          </div>

          <h2>Expense Transactions (<xsl:value-of select="ExpenseReport/TotalRecords"/>)</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Amount (Rs.)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="ExpenseReport/Transactions/Transaction">
                <tr>
                  <td>
                    <span class="category-badge"><xsl:value-of select="Category"/></span>
                  </td>
                  <td><xsl:value-of select="Subcategory"/></td>
                  <td class="amount negative">-<xsl:value-of select="format-number(Amount, '#,##0.00')"/></td>
                  <td><xsl:value-of select="Date"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <div class="footer">
            <p>Total Expense Amount: Rs. <xsl:value-of select="format-number(ExpenseReport/TotalAmount, '#,##0.00')"/></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

    const blob = new Blob([xsltContent], { type: 'application/xslt+xml' });
    saveAs(blob, 'expense-report.xsl');
    toast.success('XSLT stylesheet for expense report downloaded');
  };

  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className="block lg:hidden">
          <HorizontalNavbar />
        </div>

        <div className={`2xl:ml-64 lg:ml-28 bg-blue-50 gap-y-6 flex flex-col min-h-screen h-full`}>
          <Warning data={{ totalBudget, totalIncome, totalExpense }} />
          <div className={`flex items-center justify-center ${totalBudget >= 0 ? "mt-6" : ""}`}>
            <div className="border border-current/20 rounded-2xl w-[90%] sm:w-[90%] p-4 bg-linear-to-r from-indigo-50 to-purple-50 ">

              {/* Time Period Selector */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  {timePeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setTimePeriod(period.value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timePeriod === period.value
                        ? 'bg-linear-to-tr from-red-500 to-red-600 text-white shadow-sm'
                        : 'text-gray-600 hover:cursor-pointer hover:text-gray-700 hover:scale-105'
                        }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full flex flex-col items-center justify-between 2xl:flex 2xl:flex-row xl:flex xl:flex-row lg:flex md:flex md:flex-col sm:flex sm:flex-col">
                {/* Doughnut Chart */}
                <div className="w-[350px] p-4 2xl:w-[400px] xl:w-[100px] sm:w-[350px] md:w-[400px] flex-1 ">
                  <Doughnut
                    key={centerText}
                    data={doughnutData}
                    plugins={[centerTextPlugin]}
                    options={{
                      cutout: '70%',
                      onClick: (_, elements) => {
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
                        }
                      },
                      plugins: {
                        legend: { display: true },
                        tooltip: { enabled: true }
                      }
                    }}
                  />
                  <p className="text-gray-600 text-xs text-center font-medium w-full h-full">Doughnut chart</p>
                </div>

                {/* Line Chart */}
                <div className="w-[500px] 2xl:w-[700px] xl:w-[600px] lg:w-[700px] md:w-[600px] sm:w-[500px] p-4 lg:flex-2 flex-2 ">
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
                          text: `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Spending Trend`
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
                    Line chart - {timePeriod} view
                  </p>
                </div>
              </div>

              <p className="text-gray-600 text-[15px] text-center font-medium">
                {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Spending Trend
              </p>

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
              handleDelete(selectedItemId);
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
            onSubmit={handleExpenseSubmit}
            initialValues={{ amount: '', categories: '', subcategories: '', date: '' }}
            modalType="add"
            transactionType="expense"
          />

          <WarningModal
            isOpen={isWarningOpen}
            onClose={() => {
              setIsWarningOpen(false);
              setPendingExpense(null);
            }}
            onAddIncome={handleAddIncome}
            onContinueExpense={handleContinueExpense}
            totalBudget={totalBudget}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            pendingExpense={pendingExpense}
          />

          <div className="w-full flex items-center justify-center">
            <div className="border border-current/20 rounded-2xl w-[90%] sm:w-[90%] p-4 bg-linear-to-r from-gray-50 to-white mb-9">
              <div className="flex items-center justify-between text-center">
                <p className="text-gray-900 font-semibold">Recent Expenses</p>

                <div className="flex items-center gap-3">
                  {/* Download Report Modal */}
                  {isDownloadModalOpen && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50 backdrop-blur-sm">

                      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-extrabold text-gray-700">Download Expense Report</h2>

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
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 7 Days</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('monthly')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'monthly'
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 30 Days</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('yearly')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'yearly'
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                }`}
                            >
                              <span className="font-medium text-gray-600">Last 12 Months</span>
                            </button>
                            <button
                              onClick={() => setSelectedPeriod('custom')}
                              className={`px-4 py-3 rounded-xl border-2 transition-all ${selectedPeriod === 'custom'
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
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
                                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 outline-none focus:border-red-200 hover:text-gray-800 ${dateSelected1 ? 'text-gray-800' : 'text-gray-600'
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
                                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 outline-none focus:border-red-200 hover:text-gray-800 ${dateSelected2 ? 'text-gray-800' : 'text-gray-600'
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
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
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
                        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                          <h3 className="font-semibold text-red-700 mb-2">Report Summary</h3>
                          <div className="text-sm text-red-600">
                            <div>• Will include all expense transactions</div>
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
                            className="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 group hover:scale-102"
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
                    onClick={handleAddExpenseClick}
                    className="px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 group hover:scale-102"
                  >
                    <svg className="w-5 h-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Expense
                  </button>
                </div>
              </div>
              <hr className="text-current/20 my-3 shadow shadow-current/20" />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {transactions
                  .filter((t) => t.type === 'expense')
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
                        <div className="flex items-center space-x-2 shrink-0">
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
