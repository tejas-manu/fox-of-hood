import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">My Portfolio</div>
      <div className="status">
        <div className="invested">Invested: $10,000</div>
        <div className="current-standing">Current Standing: $12,500</div>
      </div>
    </div>
  );
}

export default Navbar;
