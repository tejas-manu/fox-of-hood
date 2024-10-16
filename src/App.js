import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import MenuBar from './components/Menubar/MenuBar';
import CompanyList from './components/CompanyList/CompanyList';
import MainContent from './components/MainContent/MainContent';
import './App.css';

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleCompanyClick = (companyName) => {
    setSelectedCompany(companyName); // Store the clicked company
  };

  return (
    <div className="app-container">
      <Navbar />
      <MenuBar /> {/* Added Menu Bar */}
      <div className="content-layout"> 
        <CompanyList onCompanyClick={handleCompanyClick} />
        <MainContent selectedCompany={selectedCompany} />
      </div>
    </div>
  );
}

export default App;
