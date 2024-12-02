import React, { useState, useEffect } from 'react';
import './Navbar.css';
import axios from 'axios';

function Navbar({ finances }) {
  const [netProfitLoss, setNetProfitLoss] = useState(0);

  useEffect(() => {
    fetchNetProfitLoss();
  }, []);

  const fetchNetProfitLoss = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:5000/portfolio`, {
        headers: { userid: userId },
      });

      const portfolio = response.data;
      if (portfolio && portfolio.length > 0) {
        const totalProfitLoss = portfolio.reduce((total, stock) => {
          const profitLoss =
            (stock.current_price - stock.purchase_price) * stock.quantity;
          return total + profitLoss;
        }, 0);
        setNetProfitLoss(totalProfitLoss);
      } else {
        setNetProfitLoss(0);
      }
    } catch (error) {
      console.error('Error fetching portfolio for net profit/loss:', error);
    }
  };

  const investedAmount = Number(finances.investedAmount || 0); // Ensure it's a number
  const currentStanding = Number(finances.currentStanding || 0); // Ensure it's a number

  return (
    <div className="navbar">
      <div className="logo">My Portfolio</div>
      <div className="status">
        <div className="invested">Invested: ${investedAmount.toFixed(2)}</div>
        <div className="current-standing">
          Wallet Balance: ${currentStanding.toFixed(2)}
        </div>
        <div className="net-profit-loss">
          Net Profit/Loss:{' '}
          <span style={{ color: netProfitLoss >= 0 ? '#4CAF50' : '#F44336' }}>
            ${netProfitLoss.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
