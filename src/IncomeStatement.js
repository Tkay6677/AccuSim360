import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function IncomeStatement() {
  const [statement, setStatement] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/api/income-statement`;
    if (dateRange.startDate && dateRange.endDate) {
      url += `?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setStatement(data))
      .catch((err) => console.error(err));
  }, [dateRange]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Income Statement</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Total Revenue</span>
            <span className="text-green-600">${statement.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-medium">Total Expenses</span>
            <span className="text-red-600">${statement.totalExpenses.toFixed(2)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-lg font-bold">
            <span>Net Income</span>
            <span className={statement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${statement.netIncome.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomeStatement;