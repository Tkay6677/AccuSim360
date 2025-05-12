import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IncomeStatement from './IncomeStatement';
import Audit from './Audit';
import './index.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'revenue', amount: '', description: '', date: new Date() });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [advice, setAdvice] = useState([]);

  // Fetch transactions and advice with date range
  useEffect(() => {
    let transactionsUrl = 'http://localhost:5000/api/transactions';
    let advisorUrl = 'http://localhost:5000/api/advisor';
    if (dateRange.startDate && dateRange.endDate) {
      const query = `?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
      transactionsUrl += query;
      advisorUrl += query;
    }
    // Fetch transactions
    fetch(transactionsUrl)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));

    // Fetch advice
    fetch(advisorUrl)
      .then((res) => res.json())
      .then((data) => setAdvice(data))
      .catch((err) => console.error(err));
  }, [dateRange]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setTransactions([...transactions, data]);
        setForm({ type: 'revenue', amount: '', description: '', date: new Date() });
      })
      .catch((err) => console.error(err));
  };

  // Calculate total revenue and expenses
  const totalRevenue = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalRevenue - totalExpenses;

  // Prepare chart data
  const dailyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { revenue: 0, expenses: 0 };
    }
    acc[date][t.type === 'revenue' ? 'revenue' : 'expenses'] += t.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(dailyData),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(dailyData).map((d) => d.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: Object.values(dailyData).map((d) => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Revenue vs. Expenses' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } },
      x: { title: { display: true, text: 'Date' } },
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date Filter */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter by Date</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="label">Start Date</label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="input"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="input"
              placeholderText="Select end date"
            />
          </div>
        </div>
      </div>

      {/* AI Advisor Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Advisor</h2>
        <div className="space-y-4">
          {advice.length === 0 ? (
            <p className="text-gray-500">No advice available yet.</p>
          ) : (
            advice.map((tip, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  tip.severity === 'error'
                    ? 'bg-red-100 border-red-300'
                    : tip.severity === 'warning'
                    ? 'bg-yellow-100 border-yellow-300'
                    : tip.severity === 'success'
                    ? 'bg-green-100 border-green-300'
                    : 'bg-blue-100 border-blue-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{tip.message}</p>
                <p className="text-sm text-gray-600">{tip.suggestion}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chart Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Financial Trends</h2>
        <div className="p-4">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Summary Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-100 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-semibold text-green-700">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-lg font-semibold text-red-700">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-gray-600">Profit</p>
            <p className="text-lg font-semibold text-blue-700">${profit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Transaction Form Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Record Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input"
            >
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Date</label>
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm({ ...form, date })}
              className="input"
              dateFormat="MM/dd/yyyy"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Add Transaction
          </button>
        </form>
      </div>

      {/* Transaction History Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="flex justify-between py-2 border-b border-gray-200"
              >
                <span>{t.description}</span>
                <span
                  className={t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}
                >
                  {t.type === 'revenue' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="header sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">AccuSim360</h1>
            <nav className="space-x-6">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/income-statement" className="nav-link">Income Statement</Link>
              <Link to="/audit" className="nav-link">Audit</Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/income-statement" element={<IncomeStatement />} />
            <Route path="/audit" element={<Audit />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;