import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import MenuBar from './components/Menubar/MenuBar';
import CompanyList from './components/CompanyList/CompanyList';
import MainContent from './components/MainContent/MainContent';
import Login from './components/Login/Login';
import './App.css';

function AppLayout({ selectedCompany, handleCompanyClick, view, setView, handleLogout }) {
  return (
    <>
      <Navbar />
      <MenuBar setView={setView} handleLogout={handleLogout} />  {/* Pass handleLogout */}
      <div className="content-layout">
        <CompanyList view={view} onCompanyClick={handleCompanyClick} />
        <MainContent selectedCompany={selectedCompany} />
      </div>
    </>
  );
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('portfolio');

  const handleCompanyClick = (companyName) => {
    setSelectedCompany(companyName);
  };

  const handleLogin = (credentials) => {
    if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('portfolio');
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? <Navigate to="/dashboard" /> : <Login handleLogin={handleLogin} />
    },
    {
      path: "/dashboard",
      element: isAuthenticated ? (
        <AppLayout 
          selectedCompany={selectedCompany} 
          handleCompanyClick={handleCompanyClick} 
          view={view} 
          setView={setView}
          handleLogout={handleLogout} // Pass handleLogout to AppLayout
        />
      ) : (
        <Navigate to="/" />
      )
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
