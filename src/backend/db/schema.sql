-- Schema for the database

-- Create 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    initial_balance NUMERIC NOT NULL,
    invested_amount NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0
);

-- Create 'portfolio' table
CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price NUMERIC NOT NULL
);

-- Create 'stock_cache' table
CREATE TABLE stock_cache (
    symbol VARCHAR PRIMARY KEY,
    price NUMERIC NOT NULL,
    last_updated DATE NOT NULL,
    previous_price NUMERIC
);

--Create 'Transaction History' table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(10, 2) AS (quantity * price) STORED,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
