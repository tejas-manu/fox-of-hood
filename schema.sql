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
