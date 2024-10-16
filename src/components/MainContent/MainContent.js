import React from 'react';
import './MainContent.css';

function MainContent({ selectedCompany }) {
  return (
    <div className="main-content">
      <div className="company-stats">
        <h3>Current Company Stats</h3>
        {selectedCompany ? (
          <p>Showing stats for {selectedCompany}</p>
        ) : (
          <p>Please select a company from the sidebar.</p>
        )}
      </div>
      <div className="user-holding">
        <h3>User Holding</h3>
        {/* Placeholder for user holdings */}
        {selectedCompany ? (
          <p>Your holding in {selectedCompany}</p>
        ) : (
          <p>No company selected.</p>
        )}
      </div>
    </div>
  );
}

export default MainContent;
