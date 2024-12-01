import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [error, setError] = useState(null); // State for error messages
  const adminId = localStorage.getItem('adminId'); 
  // Get the admin ID from local storage

  const logAction = async (action, details) => {
    try {
      await axios.post('http://localhost:5000/log', { action, details });
      console.log(`Action logged: ${action}`, details);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    console.log('Admin ID from localStorage:', adminId); // Debug adminId
  
    if (!adminId) {
      setError('Admin ID is missing. Please log in again.');
      logAction('Error', { message: 'Admin ID is missing from localStorage.' });
      return;
    }
  
    axios
      .get('http://localhost:5000/admin/users', { headers: { id: adminId } })
      .then((response) => {
        console.log('Users fetched:', response.data); // Debug response data
        logAction('Fetch Users', { success: true, usersCount: response.data.length });
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        logAction('Fetch Users Error', { success: false, error: error.message });
        setError('Failed to fetch users. Please try again.');
      });
  }, []);
  
  const addUser = () => {
    if (!newUser.username || !newUser.password) {
      setError('Username and password cannot be empty.');
      logAction('Add User Error', { success: false, reason: 'Empty fields' });
      return;
    }

    axios
      .post(
        'http://localhost:5000/admin/add-user',
        newUser,
        { headers: { id: adminId } }
      )
      .then((response) => {
        alert(response.data.message);
        console.log('User added successfully:', response.data.user);
        logAction('Add User', { success: true, username: newUser.username });
        setUsers([...users, response.data.user]); // Update the users list
        setNewUser({ username: '', password: '' }); // Clear input fields
        setError(null); // Clear any previous errors
      })
      .catch((error) => {
        console.error('Error adding user:', error);
        logAction('Add User Error', { success: false, error: error.message });
        setError('Failed to add user. Please try again.');
      });
  };

  const deleteUser = (userId) => {
    axios
      .delete(`http://localhost:5000/admin/delete-user/${userId}`, {
        headers: { id: adminId },
      })
      .then((response) => {
        alert(response.data.message);
        console.log(`User with ID ${userId} deleted successfully.`);
        logAction('Delete User', { success: true, userId });
        setUsers(users.filter((user) => user.user_id !== userId)); // Update the users list
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        logAction('Delete User Error', { success: false, error: error.message });
        setError('Failed to delete user. Please try again.');
      });
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-heading">Admin Panel</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="admin-add-user">
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className="admin-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="admin-input"
        />
        <button onClick={addUser} className="admin-button">
          Add User
        </button>
      </div>

      <div className="admin-user-list">
        <h3>User List</h3>
        <ul className="admin-users">
          {users.map((user) => (
            <li key={user.user_id} className="admin-user-item">
              <span>
                {user.username} {user.is_admin ? '(Admin)' : ''}
              </span>
              {!user.is_admin && (
                <button
                  onClick={() => deleteUser(user.user_id)}
                  className="admin-delete-button"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;
