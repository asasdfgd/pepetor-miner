import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import BalanceCard from '../components/BalanceCard';
import SessionSubmitForm from '../components/SessionSubmitForm';
import SessionHistory from '../components/SessionHistory';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshSessions, setRefreshSessions] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/users');
        if (response.success) {
          setUsers(response.data || []);
        }
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch users';
        setError(errorMessage);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSessionSubmitted = () => {
    // Trigger refresh of session history and balance
    setRefreshSessions(!refreshSessions);
  };

  const maskEmail = (email) => {
    if (!email) return '-';
    const [localPart, domain] = email.split('@');
    const visibleChars = Math.ceil(localPart.length * 0.3);
    const masked = localPart.substring(0, visibleChars) + '*'.repeat(localPart.length - visibleChars);
    return `${masked}@${domain}`;
  };

  return (
    <div className="container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2>Welcome, {user?.fullName || user?.username}! 👋</h2>
          <p>Your account is successfully authenticated</p>
        </div>

        {/* Session Receipts & Balance Section */}
        <div className="sessions-section">
          <BalanceCard />
          <SessionSubmitForm onSessionSubmitted={handleSessionSubmitted} />
          <SessionHistory refreshTrigger={refreshSessions} />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📊 Your Profile</h3>
            <div className="profile-info">
              <p>
                <strong>Username:</strong> {user?.username}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> <span className="badge">{user?.role || 'user'}</span>
              </p>
              <p>
                <strong>Status:</strong> {user?.isActive ? '✅ Active' : '❌ Inactive'}
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>📝 Statistics</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{users.length}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>👥 Users Directory</h3>
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : error ? (
            <div className="error">
              <strong>Error:</strong> {error.includes('Invalid') || error.includes('expired') ? 'Please refresh the page or log in again.' : error}
            </div>
          ) : users.length > 0 ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{maskEmail(u.email)}</td>
                      <td>{u.fullName || '-'}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>{u.isActive ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;