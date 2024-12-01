import React, { useState, useEffect } from 'react';
import './CompanyList.css';
import axios from 'axios';

function CompanyList({ view, onCompanyClick, onTransactionComplete }) {
  const [portfolio, setPortfolio] = useState([]);
  const [stockPrices, setStockPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage

  const logAction = async (action, details) => {
    try {
      await axios.post('http://localhost:5000/log', { action, details });
      console.log(`Action logged: ${action}`, details);
    } catch (logError) {
      console.error('Error logging action:', logError);
    }
  };

  useEffect(() => {
    console.log('User ID from localStorage:', userId);

    if (!userId) {
      setError('User not logged in. Please log in.');
      logAction('Error', { message: 'User ID is missing from localStorage.' });
      return;
    }

    if (view === 'portfolio') {
      fetchPortfolio();
    } else if (view === 'buy-sell') {
      fetchStockPrices();
    }
  }, [view, userId]);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/portfolio', {
        headers: { userid: userId },
      });

      if (response.data.message === 'No stocks purchased') {
        setPortfolio([]);
      } else {
        setPortfolio(response.data);
      }
      logAction('Fetch Portfolio', { success: true, dataLength: response.data.length });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      logAction('Fetch Portfolio Error', { success: false, error: error.message });
      setError('Failed to fetch portfolio. Please try again later.');
    }

    setLoading(false);
  };

  const fetchStockPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/stocks');
      setStockPrices(response.data);
      logAction('Fetch Stock Prices', { success: true, dataLength: response.data.length });
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      logAction('Fetch Stock Prices Error', { success: false, error: error.message });
      setError('Failed to fetch stock prices. Please try again later.');
    }

    setLoading(false);
  };

  const handleBuy = async (symbol, price) => {
    const quantity = prompt(`Enter quantity to buy for ${symbol}:`);
    if (!quantity || isNaN(quantity)) {
      logAction('Buy Stock Error', { success: false, reason: 'Invalid quantity' });
      return;
    }

    try {
      await axios.post('http://localhost:5000/buy-stock', {
        userId,
        symbol,
        quantity: parseInt(quantity),
        price,
      });
      alert('Stock purchased successfully');
      logAction('Buy Stock', { success: true, symbol, quantity });
      fetchPortfolio();
      onTransactionComplete(); // Trigger parent refresh
    } catch (error) {
      console.error('Error buying stock:', error);
      logAction('Buy Stock Error', { success: false, symbol, error: error.message });
      alert('Error buying stock.');
    }
  };

  const handleSell = async (symbol, price) => {
    const quantity = prompt(`Enter quantity to sell for ${symbol}:`);
    if (!quantity || isNaN(quantity)) {
      logAction('Sell Stock Error', { success: false, reason: 'Invalid quantity' });
      return;
    }

    try {
      await axios.post('http://localhost:5000/sell-stock', {
        userId,
        symbol,
        quantity: parseInt(quantity),
        price,
      });
      alert('Stock sold successfully');
      logAction('Sell Stock', { success: true, symbol, quantity });
      fetchPortfolio();
      onTransactionComplete(); // Trigger parent refresh
    } catch (error) {
      console.error('Error selling stock:', error);
      logAction('Sell Stock Error', { success: false, symbol, error: error.message });
      alert('Error selling stock.');
    }
  };

  const handleCompanySelection = (symbol) => {
    onCompanyClick(symbol); // Notify parent about selected company
    logAction('Select Company', { success: true, symbol });
  };

  const renderPortfolioView = () => {
    if (portfolio.length === 0) {
      return <div className="no-results">No stocks purchased</div>;
    }

    return portfolio.map((stock, index) => (
      <div
        key={index}
        className="company-item"
        onClick={() => handleCompanySelection(stock.symbol)}
        style={{ cursor: 'pointer' }} // Visual indication that the item is clickable
      >
        <div>
          <strong>{stock.symbol}</strong>
        </div>
        <div>Quantity: {stock.quantity}</div>
        <div>Purchase Price: ${stock.purchase_price}</div>
        <div>Current Price: ${stock.current_price}</div>
        <div className="button-group">
          <button
            className="buy-button"
            onClick={(e) => {
              e.stopPropagation();
              handleBuy(stock.symbol, stock.current_price);
            }}
          >
            Buy
          </button>
          <button
            className="sell-button"
            onClick={(e) => {
              e.stopPropagation();
              handleSell(stock.symbol, stock.current_price);
            }}
          >
            Sell
          </button>
        </div>
      </div>
    ));
  };

  const renderBuySellView = () => {
    if (stockPrices.length === 0) {
      return <div className="no-results">No stock data available</div>;
    }

    return stockPrices.map((stock, index) => (
      <div
        key={index}
        className="company-item"
        onClick={() => handleCompanySelection(stock.symbol)}
        style={{ cursor: 'pointer' }} // Visual indication that the item is clickable
      >
        <div>
          <strong>{stock.symbol}</strong>
        </div>
        <div>Current Price: ${stock.price}</div>
        <div className="button-group">
          <button
            className="buy-button"
            onClick={(e) => {
              e.stopPropagation();
              handleBuy(stock.symbol, stock.price);
            }}
          >
            Buy
          </button>
          <button
            className="sell-button"
            onClick={(e) => {
              e.stopPropagation();
              handleSell(stock.symbol, stock.price);
            }}
          >
            Sell
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="company-list-container">
      <h3>{view === 'portfolio' ? 'Your Portfolio' : 'Buy/Sell'}</h3>

      <div className="companies">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : view === 'portfolio' ? (
          renderPortfolioView()
        ) : view === 'buy-sell' ? (
          renderBuySellView()
        ) : null}
      </div>
    </div>
  );
}

export default CompanyList;
