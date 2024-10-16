import React from 'react';
import './MenuBar.css';

function MenuBar() {
  return (
    <div className="menu-bar">
      <div className="left-buttons">
        <button className="menu-button">Portfolio</button>
        <button className="menu-button">Buy/Sell</button>
      </div>
      <div className="right-buttons">
        <button className="menu-button">Profile</button>
        <button className="menu-button">Logout</button>
      </div>
    </div>
  );
}

export default MenuBar;
