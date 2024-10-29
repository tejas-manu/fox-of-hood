import React, { useState, useEffect } from 'react';
import './CompanyList.css';
import axios from 'axios';

function CompanyList({ view, onCompanyClick }) {
  const [stockPrices, setStockPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Alpha Vantage API Key
  const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';

  // Top 30 companies
  const symbols = [
    'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'FB', 'NVDA', 'JPM', 'JNJ', 'V',
    'PG', 'UNH', 'DIS', 'HD', 'MA', 'PYPL', 'VZ', 'NFLX', 'INTC', 'ADBE',
    'PFE', 'KO', 'PEP', 'CSCO', 'ORCL', 'MRK', 'XOM', 'BA', 'COST', 'WMT'
  ];

  // Fetch stock prices when switching to Buy/Sell view
  useEffect(() => {
    if (view === 'buy-sell') {
      fetchStockPrices();
    }
  }, [view]);

  // Function to fetch stock prices using Alpha Vantage API
  const fetchStockPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const stockData = {};

      // Fetch stock data for each company
      for (const company of symbols) {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${company}&interval=5min&apikey=${API_KEY}`
        );

        const timeSeries = response.data['Time Series (5min)'];
        if (timeSeries) {
          const timeStamps = Object.keys(timeSeries); 
          const latestTime = timeStamps[0]; 
          const previousTime = timeStamps[1]; 

          const latestPrice = parseFloat(timeSeries[latestTime]['1. open']); 
          const previousPrice = parseFloat(timeSeries[previousTime]['1. open']);

          
          const priceChange = latestPrice > previousPrice ? 'increase' : latestPrice < previousPrice ? 'decrease' : 'neutral';

          
          stockData[company] = {
            price: latestPrice.toFixed(2), 
            change: priceChange 
          };
        } else {
          stockData[company] = {
            price: 'N/A',
            change: 'neutral'
          };
        }
      }

      setStockPrices(stockData); 
    } catch (error) {
      setError('Failed to fetch stock prices. Please try again later.');
      console.error('Error fetching stock prices:', error);
    }

    setLoading(false);
  };

  const renderBuySellView = () => {
    return symbols.map((symbol, index) => {
      const stock = stockPrices[symbol] || {};
      const price = stock.price || 'N/A';
      const change = stock.change || 'neutral';

      // Set color based on price change
      const priceColor = change === 'increase' ? 'green' : change === 'decrease' ? 'red' : 'white';

      return (
        <div
          key={index}
          className="company-item"
          onClick={() => onCompanyClick(symbol)}
        >
          {symbol} - <span style={{ color: priceColor }}>${price}</span>
        </div>
      );
    });
  };

  return (
    <div className="company-list-container">
      <h3>{view === 'portfolio' ? 'Your Portfolio' : 'Buy/Sell'}</h3>

      <div className="companies">
        {loading ? (
          <div className="loading">Loading stock prices...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          renderBuySellView()
        )}
      </div>
    </div>
  );
}

export default CompanyList;
