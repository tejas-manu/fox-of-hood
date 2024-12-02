import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionHistory.css';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in.');
      return;
    }

    axios
      .get('http://localhost:5000/transactions', {
        headers: { userid: userId },
      })
      .then((response) => setTransactions(response.data))
      .catch(() => setError('Error fetching transaction history.'));
  }, []);

  return (
    <div className="transaction-history">
      <h3>Your Transaction History</h3>
      {error ? (
        <p className="error">{error}</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{new Date(transaction.transaction_date).toLocaleString()}</td>
                <td>{transaction.transaction_type}</td>
                <td>{transaction.symbol}</td>
                <td>{transaction.quantity}</td>
                <td>${Number(transaction.price || 0).toFixed(2)}</td>
                <td>${Number(transaction.total_value || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionHistory;
