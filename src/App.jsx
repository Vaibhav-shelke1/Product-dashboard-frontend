import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css'; // We'll create this file for our CSS

const API_BASE_URL = 'http://localhost:5000/api/product';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [priceRangeData, setPriceRangeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth, currentPage]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsRes, combinedDataRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions?month=${selectedMonth}&search=${searchTerm}&page=${currentPage}`),
        axios.get(`${API_BASE_URL}/combined-data?month=${selectedMonth}`)
      ]);

      setTransactions(transactionsRes.data);
      setStatistics(combinedDataRes.data.statistics);
      setPriceRangeData(combinedDataRes.data.priceRange);
      setCategoryData(combinedDataRes.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAllData();
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Product Transactions Dashboard</h1>
      
      <div className="controls">
        <select value={selectedMonth} onChange={handleMonthChange}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month.toString().padStart(2, '0')}>
              {format(new Date(2023, month - 1), 'MMMM')}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search transactions"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="card transactions">
        <h2>Transactions</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Date of Sale</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.price.toFixed(2)}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.sold ? 'Yes' : 'No'}</td>
                  <td>{format(new Date(transaction.dateOfSale), 'yyyy-MM-dd')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button onClick={() => setCurrentPage((prev) => prev + 1)}>
            Next
          </button>
        </div>
      </div>

      <div className="statistics-charts">
        <div className="card statistics">
          <h2>Statistics</h2>
          <div className="stat-grid">
            <div className="stat-item">
              <h3>Total Sale Amount</h3>
              <p>${statistics.totalSaleAmount?.toFixed(2) || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Total Sold Items</h3>
              <p>{statistics.totalSoldItems || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Total Not Sold Items</h3>
              <p>{statistics.totalNotSoldItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="card chart">
          <h2>Price Range Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card chart">
        <h2>Category Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="count"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;