
# Portfolio Management System

A full-stack web application for managing personal investment portfolios. Users can view their portfolio, analyze profit/loss, buy and sell stocks, and administrators can manage users through an admin panel.

---

## Features

### User Features
- **Login/Registration with CAPTCHA**: Secured user authentication.
- **Portfolio Overview**: View invested amount, current standings, and portfolio distribution.
- **Buy/Sell Stocks**: Real-time stock transactions with updated prices.
- **Profit/Loss Analysis**: Visualize portfolio performance using dynamic charts.

### Admin Features
- **User Management**: Add, delete, and manage user accounts.
- **Admin Panel**: View user details and perform administrative tasks.

---

## Visual Insights
- **Pie Chart**: Portfolio distribution across different stocks.
- **Bar Chart**: Profit/Loss analysis for each stock.

---

## Tech Stack

### Frontend
- **React.js**: For building the user interface.
- **Chart.js**: For visualizing portfolio data.
- **Axios**: For API integration.

### Backend
- **Node.js + Express**: RESTful API for handling requests.
- **PostgreSQL**: Database for storing user, portfolio, and stock data.

---

## Installation Guide

### Prerequisites
- **Node.js**: v14.x or higher
- **PostgreSQL**: v13.x or higher
- **npm**: v6.x or higher

---

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/{your-username}/fox-of-hood.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure PostgreSQL:
   - Create a database named `myapp_db`.
   - Run the SQL scripts in `src/backend/db/schema.sql` to set up tables.
   - Update the database connection in `server.js`:
     ```javascript
     const pool = new pg.Pool({
       user: 'postgres',
       host: 'localhost',
       database: 'myapp_db',
       password: 'your_password',
       port: 5432,
     });
     ```

4. Start the backend server:
   ```bash
   cd fox-of-hood/src/backend
   node server.js
   ```

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd fox-of-hood
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend server:
   ```bash
   npm start
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000).

---

## Usage Guide

### User Guide
- **Registration**: Create an account using the registration form with CAPTCHA.
- **Login**: Enter credentials to log in.
- **Portfolio Management**:
  - View your current investments.
  - Buy or sell stocks using the stock market interface.
  - Analyze your portfolio using the visual charts.
- **Logout**: Securely log out using the menu bar.

### Admin Guide
- **Login as Admin**: Use an admin account to access the admin panel.
- **Manage Users**:
  - Add users with username and password.
  - Delete non-admin users.

---

## API Endpoints

### Authentication
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and log in a user.

### Portfolio
- `GET /portfolio`: Fetch user portfolio.
- `POST /buy-stock`: Buy stock for the user.
- `POST /sell-stock`: Sell stock for the user.

### Admin
- `GET /admin/users`: Fetch all users.
- `POST /admin/add-user`: Add a new user (admin-only).
- `DELETE /admin/delete-user/:id`: Delete a user (admin-only).

---

## Project Structure

```
fox-of-hood/
│   ├── public/
│   │   ├── index.html
│   ├── src/
│   │   ├── backend/
│   │   │   ├── server.js           # Node.js backend server
│   │   │   ├── db/
│   │   │   │   ├── schema.sql      # Database schema
│   │   │   └── package.json        # Backend dependencies
│   │   ├── components/
│   │   │   ├── Login.js    # Login and Registration component
│   │   │   ├── AdminPanel.js # Admin management panel
│   │   │   ├── MenuBar.js  # Navigation bar
│   │   │   ├── MainContent.js # Portfolio visualization
│   │   │   ├── Navbar.js   # Top navigation
│   │   └── App.js          # Main React component
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

---

## Known Issues and Debugging Tips

### Common Issues
- **Invalid CAPTCHA**: Ensure the CAPTCHA keys are correct and reCAPTCHA is integrated properly.
- **Database Connection Error**: Verify PostgreSQL is running and credentials are correct.
- **Chart Not Displaying**: Ensure valid data is returned from the `/portfolio` endpoint.

### Debugging Tips
- Check logs in the backend (`backend/application.log`) for detailed errors.
- Use browser developer tools to inspect API requests and responses.

