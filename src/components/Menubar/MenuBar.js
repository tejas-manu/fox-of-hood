import React from 'react';
import './MenuBar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MenuBar({ setView, isAdmin, handleLogout }) {
  const navigate = useNavigate();

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

  const handleViewChange = (view) => {
    setView(view);
    logAction('View Change', { view, timestamp: new Date().toISOString() });
  };

  const handleLogoutClick = () => {
    logAction('User Logout', { timestamp: new Date().toISOString() });
    handleLogout();
    navigate('/');
  };

  return (
    <div className="menu-bar">
      <div className="left-buttons">
        <button
          className="menu-button"
          onClick={() => handleViewChange('portfolio')}
        >
          Portfolio
        </button>
        <button
          className="menu-button"
          onClick={() => handleViewChange('buy-sell')}
        >
          Buy/Sell
        </button>
        <button
          className="menu-button"
          onClick={() => handleViewChange('transaction-history')}
        >
          Transaction History
        </button>
        {isAdmin && (
          <button
            className="menu-button"
            onClick={() => handleViewChange('admin-panel')}
          >
            Admin Panel
          </button>
        )}
      </div>
      <div className="right-buttons">
        <button className="menu-button" onClick={() => setView('profile')}>Profile</button>
        <button className="menu-button" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default MenuBar;
