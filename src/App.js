import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import MenuBar from './components/Menubar/MenuBar';
import CompanyList from './components/CompanyList/CompanyList';
import MainContent from './components/MainContent/MainContent';
import AdminPanel from './components/AdminPanel/AdminPanel';
import TransactionHistory from './components/TransactionHistory/TransactionHistory';
import UserProfile from './components/Profile/Profile'; // Import UserProfile
import Login from './components/Login/Login';
import './App.css';

function AppLayout({
  selectedCompany,
  handleCompanyClick,
  view,
  setView,
  handleLogout,
  isAdmin,
  finances,
  fetchUserFinances,
  refreshTrigger,
}) {
  return (
    <>
      <Navbar finances={finances} />
      <MenuBar setView={setView} handleLogout={handleLogout} isAdmin={isAdmin} />
      <div className="content-layout">
        {view === 'admin-panel' ? (
          <AdminPanel />
        ) : view === 'transaction-history' ? (
          <TransactionHistory />
        ) : view === 'profile' ? (
          <UserProfile refreshTrigger={refreshTrigger} fetchUserFinances={fetchUserFinances} />
        ) : (
          <>
            <CompanyList
              view={view}
              onCompanyClick={handleCompanyClick}
              onTransactionComplete={fetchUserFinances} // Use fetchUserFinances to update data
            />
            <MainContent
              selectedCompany={selectedCompany}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </div>
    </>
  );
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('portfolio');
  const [clearFields, setClearFields] = useState(false);
  const [finances, setFinances] = useState({ investedAmount: 0, currentStanding: 1000000 });

  const [refreshTrigger, setRefreshTrigger] = useState(false); // Refresh trigger

  const handleCompanyClick = (companyName) => {
    setSelectedCompany(companyName);
    setRefreshTrigger((prev) => !prev); // Trigger refresh on company selection
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credentials.email, password: credentials.password }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Login successful') {
        setIsAuthenticated(true);
        setIsAdmin(data.user.is_admin);
        localStorage.setItem('adminId', data.user.id);
        localStorage.setItem('userId', data.user.id);
        fetchUserFinances(); // Fetch finances upon login
      } else {
        alert(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during login, please try again.');
    }
  };

  const handleRegister = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credentials.email, password: credentials.password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Registration successful');
        setClearFields(true);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration, please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setView('portfolio');
    setClearFields(true);
  };

  const fetchUserFinances = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/user-finances/${userId}`);
      const data = await response.json();

      setFinances({
        investedAmount: data.invested_amount,
        currentStanding: data.current_balance,
      });
      setRefreshTrigger((prev) => !prev); // Trigger refresh for graphs
    } catch (error) {
      console.error('Error fetching user finances:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserFinances();
    }
  }, [isAuthenticated]);

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? (
        <Navigate to="/dashboard" />
      ) : (
        <Login handleLogin={handleLogin} handleRegister={handleRegister} clearFields={clearFields} />
      ),
    },
    {
      path: '/dashboard',
      element: isAuthenticated ? (
        <AppLayout
          selectedCompany={selectedCompany}
          handleCompanyClick={handleCompanyClick}
          view={view}
          setView={setView}
          handleLogout={handleLogout}
          isAdmin={isAdmin}
          finances={finances}
          fetchUserFinances={fetchUserFinances}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <Navigate to="/" />
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
