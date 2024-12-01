import React, { useEffect } from 'react';
import './Navbar.css';
import axios from 'axios';

function Navbar({ finances }) {
  const investedAmount = Number(finances.investedAmount || 0); // Ensure it's a number
  const currentStanding = Number(finances.currentStanding || 0); // Ensure it's a number

  // Log actions to the backend
  const logAction = async (action, details) => {
    try {
      await axios.post('http://localhost:5000/log', {
        action,
        details,
      });
      console.log(`Logged action: ${action}`);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  useEffect(() => {
    logAction('Navbar Render', {
      investedAmount,
      currentStanding,
      timestamp: new Date().toISOString(),
    });
  }, [investedAmount, currentStanding]); // Trigger log whenever finances change

  return (
    <div className="navbar">
      <div className="logo">My Portfolio</div>
      <div className="status">
        <div className="invested">Invested: ${investedAmount.toFixed(2)}</div>
        <div className="current-standing">Wallet Balance: ${currentStanding.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default Navbar;
