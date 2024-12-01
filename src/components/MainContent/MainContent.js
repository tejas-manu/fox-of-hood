import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import './MainContent.css';

// Register necessary components for Chart.js
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function MainContent({ selectedCompany }) {
  const [userHoldings, setUserHoldings] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [profitData, setProfitData] = useState(null);

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
    logAction('Fetch User Holdings', { status: 'Initiated' }); // Log the start of data fetch
    fetchUserHoldings();
  }, []);

  const fetchUserHoldings = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      logAction('Fetch User Holdings', { status: 'Failed', reason: 'Missing User ID' });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/portfolio`, {
        headers: { userid: userId },
      });

      const data = response.data.filter(stock => stock.quantity > 0);
      setUserHoldings(data);

      logAction('Fetch User Holdings', { status: 'Success', holdingsCount: data.length });

      prepareChartData(data);
      prepareProfitData(data);
    } catch (error) {
      console.error('Error fetching user holdings:', error);
      logAction('Fetch User Holdings', { status: 'Failed', error: error.message });
    }
  };

  const prepareChartData = (data) => {
    const labels = data.map(stock => stock.symbol);
    const values = data.map(stock => stock.quantity * stock.current_price);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Portfolio Distribution',
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    });

    logAction('Prepare Chart Data', {
      status: 'Success',
      labels,
      totalValues: values.reduce((a, b) => a + b, 0),
    });
  };

  const prepareProfitData = (data) => {
    const labels = data.map(stock => stock.symbol);
    const profits = data.map(stock =>
      (stock.current_price - stock.purchase_price) * stock.quantity
    );

    setProfitData({
      labels,
      datasets: [
        {
          label: 'Profit/Loss',
          data: profits,
          backgroundColor: profits.map(value => (value >= 0 ? '#4CAF50' : '#F44336')),
          borderWidth: 1,
        },
      ],
    });

    logAction('Prepare Profit Data', {
      status: 'Success',
      labels,
      profits,
    });
  };

  return (
    <div className="main-content">
      <div className="user-holding">
        <h3>User Holdings</h3>
        {userHoldings.length > 0 ? (
          <div className="charts">
            {chartData && (
              <div className="chart-container">
                <h4>Portfolio Distribution</h4>
                <Pie data={chartData} />
              </div>
            )}
            {profitData && (
              <div className="chart-container">
                <h4>Profit/Loss</h4>
                <Bar data={profitData} />
              </div>
            )}
          </div>
        ) : (
          <p>No holdings to display.</p>
        )}
        {/* Add a Refresh Button */}
        <button
          className="refresh-button"
          onClick={() => {
            logAction('Refresh Button Clicked', { timestamp: new Date().toISOString() });
            fetchUserHoldings();
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default MainContent;
