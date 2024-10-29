import React from 'react';
import './MenuBar.css';
import { useNavigate } from 'react-router-dom';

function MenuBar({ setView, handleLogout }) { 
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout(); 
    navigate('/');  
  };

  return (
    <div className="menu-bar">
      <div className="left-buttons">
        <button className="menu-button" onClick={() => setView('portfolio')}>Portfolio</button>
        <button className="menu-button" onClick={() => setView('buy-sell')}>Buy/Sell</button>
      </div>
      <div className="right-buttons">
        <button className="menu-button">Profile</button>
        <button className="menu-button" onClick={handleLogoutClick}>Logout</button>
      </div>
    </div>
  );
}

export default MenuBar;

