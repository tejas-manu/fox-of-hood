import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ handleLogin, handleRegister, clearFields }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Fetch CAPTCHA from the server
  const fetchCaptcha = async () => {
    try {
      const response = await axios.get('http://localhost:5000/captcha');
      setCaptchaText(response.data.captchaText);
      setCaptchaKey(response.data.captchaKey);
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
    if (clearFields) {
      setEmail('');
      setPassword('');
      setUserCaptcha('');
    }
  }, [clearFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify CAPTCHA
    try {
      const captchaResponse = await axios.post('http://localhost:5000/verify-captcha', {
        captchaKey,
        userCaptcha,
      });

      if (!captchaResponse.data.success) {
        setCaptchaError(true);
        fetchCaptcha(); // Refresh CAPTCHA
        return;
      }
      setCaptchaError(false); // Reset error if CAPTCHA is valid

      const formData = { email, password };

      if (isRegistering) {
        if (handleRegister) {
          handleRegister(formData); // Call register function
        } else {
          console.error('handleRegister is not defined');
        }
      } else {
        handleLogin(formData); // Call login function
      }
    } catch (error) {
      console.error('Error verifying CAPTCHA:', error);
    }
  };

  const toggleRegistering = () => {
    setIsRegistering(!isRegistering);
    fetchCaptcha(); // Refresh CAPTCHA when toggling
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
          <div className="form-group">
            <label>CAPTCHA:</label>
            <div className="captcha-box">
              <span>{captchaText}</span>
              <button
                type="button"
                onClick={fetchCaptcha}
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              required
              placeholder="Enter CAPTCHA"
            />
          </div>
          {captchaError && <p className="error">Invalid CAPTCHA, try again!</p>}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <button onClick={toggleRegistering}>
          {isRegistering ? 'Already have an account? Login' : 'Create an account'}
        </button>
      </div>
    </div>
  );
};

export default Login;
