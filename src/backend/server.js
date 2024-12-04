const express = require('express');
const pg = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const axios = require('axios');
const winston = require('winston');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'application.log' }),
  ],
});

// Example log
logger.info('Winston logging initialized');

// Replace console.log with logger
logger.info('Server is running...');

// PostgreSQL connection
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myapp_db',
  password: 'postgres',
  port: 5432,
});

// Alpha Vantage API Details
const API_KEY = 'FBW9SB9S6JMHHZVR';
const symbols = [
  'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'FB', 'NVDA', 'JPM',
  'JNJ', 'V', 'PG', 'UNH', 'DIS', 'HD', 'MA', 'PYPL', 'VZ',
  'NFLX', 'INTC', 'ADBE', 'PFE', 'KO', 'PEP', 'CSCO', 'ORCL',
  'MRK', 'XOM', 'BA', 'COST', 'WMT',
];


// CAPTCHA store
const captchaStore = new Map(); // Stores captcha text with a unique key

// Generate CAPTCHA
app.get('/captcha', (req, res) => {
  const captchaText = randomBytes(3).toString('hex').slice(0, 5).toUpperCase(); // Simple random 5-character text
  const captchaKey = randomBytes(4).toString('hex'); // Unique key for each CAPTCHA
  captchaStore.set(captchaKey, captchaText);

  res.json({ captchaKey, captchaText });
});

// Verify CAPTCHA
app.post('/verify-captcha', (req, res) => {
  const { captchaKey, userCaptcha } = req.body;
  const storedCaptcha = captchaStore.get(captchaKey);

  if (storedCaptcha && storedCaptcha === userCaptcha.toUpperCase()) {
    captchaStore.delete(captchaKey); // Remove CAPTCHA after validation
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid CAPTCHA' });
  }
});

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
  const adminId = req.headers.id;
  logger.info(`Admin verification initiated for ID: ${adminId}`);
  if (!adminId || isNaN(adminId)) {
    logger.warn('Invalid or missing Admin ID.');
    return res.status(400).json({ message: 'Invalid or missing Admin ID.' });
  }

  try {
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [adminId]);
    if (result.rows.length > 0 && result.rows[0].is_admin) {
      logger.info(`Admin verification successful for ID: ${adminId}`);
      next();
    } else {
      logger.warn(`Access denied for ID: ${adminId}`);
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    logger.error('Error verifying admin status:', error.message);
    res.status(500).json({ message: 'Error verifying admin status.' });
  }
};



// Fetch stock prices from Alpha Vantage API
const fetchStockDataFromAPI = async (symbol) => {
  logger.info(`Fetching stock data for symbol: ${symbol}`);
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );
    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      logger.warn(`No time series data available for ${symbol}`);
      return null;
    }

    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const previousDate = dates[1];
    const latestPrice = parseFloat(timeSeries[latestDate]['4. close']).toFixed(2);
    const previousPrice = parseFloat(timeSeries[previousDate]['4. close']).toFixed(2);

    logger.info(`Fetched data for ${symbol}: Latest Price - ${latestPrice}, Previous Price - ${previousPrice}`);
    return { latestPrice, previousPrice };
  } catch (error) {
    logger.error(`Error fetching stock data for ${symbol}: ${error.message}`);
    return null;
  }
};

// Update the cache in the database
const updateCache = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate());
  const today = yesterday.toISOString().split('T')[0];

  logger.info('Updating stock cache...');
  for (const symbol of symbols) {
    const priceData = await fetchStockDataFromAPI(symbol);
    if (priceData) {
      try {
        logger.info(`Updating cache for ${symbol} with data: ${JSON.stringify(priceData)}`);
        await pool.query(
          `INSERT INTO stock_cache (symbol, price, previous_price, last_updated)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (symbol)
           DO UPDATE SET price = $2, previous_price = $3, last_updated = $4`,
          [symbol, priceData.latestPrice, priceData.previousPrice, today]
        );
        logger.info(`Cache updated for ${symbol}`);
      } catch (error) {
        logger.error(`Error updating cache for ${symbol}: ${error.message}`);
      }
    } else {
      logger.warn(`No data available for ${symbol}, skipping update.`);
    }
  }
};

// Fetch cached or updated stock prices
app.get('/stocks', async (req, res) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate());
  const previousDay = yesterday.toISOString().split('T')[0];

  logger.info(`Fetching stocks for date: ${previousDay}`);
  try {
    const cachedData = await pool.query('SELECT * FROM stock_cache WHERE last_updated = $1', [previousDay]);
    if (cachedData.rows.length > 0) {
      logger.info('Serving cached stock data.');
      return res.json(cachedData.rows);
    }

    logger.info('No cached data found. Updating cache...');
    await updateCache();
    const updatedData = await pool.query('SELECT * FROM stock_cache WHERE last_updated = $1', [previousDay]);
    logger.info('Serving updated stock data.');
    res.json(updatedData.rows);
  } catch (error) {
    logger.error('Error fetching stocks:', error.message);
    res.status(500).json({ message: 'Error fetching stock prices' });
  }
});

// Register a new user
app.post('/register', async (req, res) => {
  logger.info('User registration initiated.');
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, FALSE) RETURNING *',
      [username, hashedPassword]
    );
    logger.info(`User registered successfully: ${username}`);
    res.json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    logger.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login a user
app.post('/login', async (req, res) => {
  logger.info('User login initiated.');
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        logger.info(`Login successful for user: ${username}`);
        res.json({ message: 'Login successful', user });
      } else {
        logger.warn(`Invalid password for user: ${username}`);
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      logger.warn(`User not found: ${username}`);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error('Error during user login:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// Get user's portfolio
app.get('/portfolio', async (req, res) => {
    const userId = req.headers.userid;
    logger.info(`Fetching portfolio for user ID: ${userId}`);
    if (!userId || isNaN(userId)) {
      logger.warn('Invalid or missing User ID.');
      return res.status(400).json({ message: 'Invalid or missing User ID.' });
    }
  
    try {
      const result = await pool.query(
        'SELECT symbol, quantity, purchase_price FROM portfolio WHERE user_id = $1',
        [userId]
      );
  
      if (result.rows.length === 0) {
        logger.info('No stocks purchased for this user.');
        return res.json({ message: 'No stocks purchased' });
      }
  
      const stockPrices = {};
      for (const stock of result.rows) {
        const cachedStock = await pool.query(
          'SELECT price FROM stock_cache WHERE symbol = $1',
          [stock.symbol]
        );
        stockPrices[stock.symbol] = cachedStock.rows[0]?.price || 'N/A';
      }
  
      const portfolioWithPrices = result.rows.map((stock) => ({
        ...stock,
        current_price: stockPrices[stock.symbol],
      }));
  
      logger.info(`Portfolio fetched successfully for user ID: ${userId}`);
      res.json(portfolioWithPrices);
    } catch (error) {
      logger.error('Error fetching portfolio:', error.message);
      res.status(500).json({ message: 'Error fetching portfolio.' });
    }
  });


// Get user finances
app.get('/user-finances/:userId', async (req, res) => {
    const { userId } = req.params;
    logger.info(`Fetching finances for user ID: ${userId}`);
  
    if (!userId || isNaN(userId)) {
      logger.warn('Invalid or missing User ID.');
      return res.status(400).json({ message: 'Invalid or missing User ID.' });
    }
  
    try {
      const result = await pool.query('SELECT invested_amount, current_balance FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        logger.warn('User not found.');
        return res.status(404).json({ message: 'User not found' });
      }
      logger.info('User finances fetched successfully.');
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching user finances:', error.message);
      res.status(500).json({ message: 'Error fetching user finances.' });
    }
  });


// Buy stock endpoint
app.post('/buy-stock', async (req, res) => {
    const { userId, symbol, quantity, price } = req.body;
  
    logger.info(`Buy stock request initiated for user ${userId}, symbol ${symbol}, quantity ${quantity}, price ${price}`);
  
    if (!userId || !symbol || !quantity || !price) {
      logger.warn('Missing required fields in buy stock request.');
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const totalCost = quantity * price;
  
      // Fetch user's current balance
      const userResult = await pool.query('SELECT current_balance FROM users WHERE id = $1', [userId]);
  
      if (userResult.rows.length === 0) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
  
      const currentBalance = userResult.rows[0].current_balance;
  
      // Check if the user has sufficient balance
      if (currentBalance < totalCost) {
        logger.warn(`Insufficient balance for user ${userId}. Available: ${currentBalance}, Required: ${totalCost}`);
        return res.status(400).json({ message: 'Insufficient balance' });
      }
  
      await pool.query('BEGIN');
  
      // Insert or update portfolio
      await pool.query(
        `
        INSERT INTO portfolio (user_id, symbol, quantity, purchase_price)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, symbol)
        DO UPDATE SET
          quantity = portfolio.quantity + EXCLUDED.quantity,
          purchase_price = EXCLUDED.purchase_price
        `,
        [userId, symbol, quantity, price]
      );
      logger.info(`Portfolio updated for user ${userId}, symbol ${symbol}, quantity ${quantity}, price ${price}`);
  
      // Update user's financials
      await pool.query(
        `
        UPDATE users
        SET
          current_balance = current_balance - $1,
          invested_amount = invested_amount + $1
        WHERE id = $2
        `,
        [totalCost, userId]
      );
      logger.info(`User finances updated for ${userId}. Total cost: ${totalCost}`);

      await pool.query(`
        INSERT INTO transactions (user_id, symbol, transaction_type, quantity, price)
        VALUES ($1, $2, 'BUY', $3, $4)
    `, [userId, symbol, quantity, price]);

      logger.info(`User transaction updated for ${userId}.`);
    
  
      await pool.query('COMMIT');
      res.json({ message: 'Stock purchased successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      logger.error('Error processing buy stock request:', error.message);
      res.status(500).json({ message: 'Error processing request' });
    }
  });
  
  // Sell stock endpoint
  app.post('/sell-stock', async (req, res) => {
    const { userId, symbol, quantity, price } = req.body;
  
    logger.info(`Sell stock request initiated for user ${userId}, symbol ${symbol}, quantity ${quantity}, price ${price}`);
  
    if (!userId || !symbol || !quantity || !price) {
      logger.warn('Missing required fields in sell stock request.');
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const userPortfolio = await pool.query(
        'SELECT quantity FROM portfolio WHERE user_id = $1 AND symbol = $2',
        [userId, symbol]
      );
  
      if (userPortfolio.rows.length === 0) {
        logger.warn(`Stock not found in portfolio for user ${userId}, symbol ${symbol}`);
        return res.status(404).json({ message: 'Stock not found in portfolio' });
      }
  
      const currentQuantity = userPortfolio.rows[0].quantity;
      if (currentQuantity < quantity) {
        logger.warn(`Not enough shares to sell for user ${userId}, symbol ${symbol}. Available: ${currentQuantity}`);
        return res.status(400).json({ message: 'Not enough shares to sell' });
      }
  
      await pool.query('BEGIN');
  
      // Update or delete stock based on resulting quantity
      if (currentQuantity - quantity > 0) {
        logger.info(`Updating quantity for user ${userId}, symbol ${symbol}, new quantity: ${currentQuantity - quantity}`);
        await pool.query(
          `UPDATE portfolio
           SET quantity = quantity - $1
           WHERE user_id = $2 AND symbol = $3`,
          [quantity, userId, symbol]
        );
      } else {
        logger.info(`Deleting stock ${symbol} for user ${userId}`);
        await pool.query(
          `DELETE FROM portfolio
           WHERE user_id = $1 AND symbol = $2`,
          [userId, symbol]
        );
      }
  
      const totalSale = quantity * price;
  
      // Update user's finances
      await pool.query(
        `UPDATE users
         SET current_balance = current_balance + $1,
             invested_amount = invested_amount - $2
         WHERE id = $3`,
        [totalSale, quantity * (price / 2), userId]
      );
      logger.info(`User finances updated for ${userId}. Total sale: ${totalSale}`);

      await pool.query(`
        INSERT INTO transactions (user_id, symbol, transaction_type, quantity, price)
        VALUES ($1, $2, 'SELL', $3, $4)
    `, [userId, symbol, quantity, price]);

      logger.info(`User transaction updated for ${userId}.`);
    
  
      await pool.query('COMMIT');
      res.json({ message: 'Stock sold successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      logger.error('Error processing sell stock request:', error.message);
      res.status(500).json({ message: 'Error processing request' });
    }
  });


  app.get('/user-finances/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await pool.query('SELECT invested_amount, current_balance FROM users WHERE id = $1', [userId]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user finances:', error);
      res.status(500).json({ message: 'Error fetching user finances.' });
    }
  });


// Add a new user (Admin only)
app.post('/admin/add-user', verifyAdmin, async (req, res) => {
    const { username, password } = req.body;
    logger.info('Admin adding a new user.');
  
    if (!username || !password) {
      logger.warn('Username and password are required.');
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, FALSE) RETURNING *',
        [username, hashedPassword]
      );
      logger.info(`New user added successfully by admin: ${username}`);
      res.json({ message: 'User added successfully', user: result.rows[0] });
    } catch (error) {
      logger.error('Error adding new user:', error.message);
      res.status(500).json({ message: 'Server error while adding user.' });
    }
  });
  
  // Delete a user (Admin only)
  app.delete('/admin/delete-user/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    logger.info(`Admin deleting user ID: ${id}`);
  
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID.');
      return res.status(400).json({ message: 'Invalid user ID.' });
    }
  
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      if (result.rowCount > 0) {
        logger.info(`User ID ${id} deleted successfully.`);
        res.json({ message: 'User deleted successfully.' });
      } else {
        logger.warn(`User ID ${id} not found.`);
        res.status(404).json({ message: 'User not found.' });
      }
    } catch (error) {
      logger.error('Error deleting user:', error.message);
      res.status(500).json({ message: 'Server error while deleting user.' });
    }
  });

  app.get('/admin/users', verifyAdmin, async (req, res) => {
    logger.info('Admin user fetching request received.');
  
    try {
      const result = await pool.query('SELECT id AS user_id, username, is_admin FROM users');
      logger.info(`Fetched ${result.rows.length} user(s) successfully.`);
      res.json(result.rows);
    } catch (error) {
      logger.error(`Error fetching users: ${error.message}`);
      res.status(500).json({ message: 'Server error while fetching users.' });
    }
  });



  app.post('/log', (req, res) => {
    const { action, details } = req.body;
    logger.info(`Action: ${action}, Details: ${JSON.stringify(details)}`);
    res.status(200).send({ message: 'Log received' });
  });

// Fetch a user's transaction history
app.get('/transactions', async (req, res) => {
  const userId = req.headers.userid;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid or missing User ID.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user transaction history:', error.message);
    res.status(500).json({ message: 'Error fetching transaction history.' });
  }
});

// Fetch all users' transaction history (Admin only)
app.get('/admin/all-transactions', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY transaction_date DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all users transaction history:', error.message);
    res.status(500).json({ message: 'Error fetching all transactions.' });
  }
});

// Fetch user details
app.get('/user/details', async (req, res) => {
  const userId = req.headers.userid;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing.' });
  }

  try {
    const result = await pool.query(
      'SELECT username, first_name, last_name, phone_number, email, city, state, current_balance FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details.' });
  }
});

// Update user profile
app.post('/user/update', async (req, res) => {
  const { userId, firstName, lastName, phoneNumber, city, state } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing.' });
  }

  try {
    await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, city = $4, state = $5 WHERE id = $6',
      [firstName, lastName, phoneNumber, city, state, userId]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// Update user password
app.post('/user/update-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password);

    if (!isValid) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password.' });
  }
});


  
  
// Start the server
app.listen(5000, () => {
  logger.info('Backend server is running on http://localhost:5000');
});
