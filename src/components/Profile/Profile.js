import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [userDetails, setUserDetails] = useState(() => {
    // Load details from localStorage if available
    const savedDetails = localStorage.getItem('userDetails');
    return savedDetails ? JSON.parse(savedDetails) : {};
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/details', {
          headers: { userid: localStorage.getItem('userId') },
        });
        setUserDetails(response.data);
        setFormData(response.data);
        // Save details to localStorage
        localStorage.setItem('userDetails', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Error fetching user details.');
      }
    };

    // Fetch details only if not already in localStorage
    if (!localStorage.getItem('userDetails')) {
      fetchDetails();
    }
  }, []);


  
  const handleUpdateProfile = async () => {
    try {
      const response = await axios.post('http://localhost:5000/user/update', {
        ...formData,
        userId: localStorage.getItem('userId'),
      });
      setUserDetails(formData);
      setEditMode(false);
      setSuccess(response.data.message);
      // Update localStorage with new details
      localStorage.setItem('userDetails', JSON.stringify(formData));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await axios.post('http://localhost:5000/user/update-password', {
        ...passwordData,
        userId: localStorage.getItem('userId'),
      });
      setPasswordData({ oldPassword: '', newPassword: '' });
      setSuccess(response.data.message);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Error updating password.');
    }
  };

  return (
    <div className="profile-container">
      <h3 className="profile-title">User Profile</h3>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="profile-content">
        <div className="profile-section">
          {editMode ? (
            <div className="profile-form">
              <label>First Name:</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <label>Last Name:</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
              <label>Phone Number:</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
              <label>Email:</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <label>City:</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <label>State:</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <button onClick={handleUpdateProfile} className="profile-button">
                Save
              </button>
              <button onClick={() => setEditMode(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          ) : (
            <div className="profile-details">
              <p>Username: {userDetails.username}</p>
              <p>First Name: {userDetails.first_name}</p>
              <p>Last Name: {userDetails.last_name}</p>
              <p>Phone Number: {userDetails.phone_number}</p>
              <p>Email: {userDetails.email}</p>
              <p>City: {userDetails.city}</p>
              <p>State: {userDetails.state}</p>
              {/* <p>Wallet Balance: ${userDetails.current_balance}</p> */}
              <button
                onClick={() => {
                  setFormData({ ...userDetails }); // Ensure formData is populated with userDetails
                  setEditMode(true);
                }}
                className="profile-button"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
        <div className="change-password-section">
          <h4>Change Password</h4>
          <input
            type="password"
            placeholder="Old Password"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
          <button onClick={handleChangePassword} className="profile-button">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
