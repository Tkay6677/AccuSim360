import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Audit() {
  const [issues, setIssues] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/api/audit`;
    if (dateRange.startDate && dateRange.endDate) {
      url += `?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setIssues(data))
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Audit Report</h2>
        {issues.length === 0 ? (
          <p className="text-gray-500">No suspicious transactions found.</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.transactionId}
                className="p-4 bg-yellow-100 rounded-lg border border-yellow-300"
              >
                <p className="text-sm font-medium text-yellow-800">{issue.issue}</p>
                <p className="text-sm text-gray-600">
                  {issue.description} ({issue.type}): ${issue.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(issue.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Audit;