import React, { useState, useEffect } from 'react';
import './Login.css'; // Styling

const Login = ({ handleLogin, handleRegister, clearFields }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register

  
  useEffect(() => {
    if (clearFields) {
      setEmail('');
      setPassword('');
    }
  }, [clearFields]);  // This effect will run whenever clearFields changes

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      handleRegister({ email, password }); // Call register function
    } else {
      handleLogin({ email, password }); // Call login function
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : 'Create an account'}
        </button>
      </div>
    </div>
  );
};

export default Login;
