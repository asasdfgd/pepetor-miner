import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import BalanceCard from '../components/BalanceCard';
import SessionSubmitForm from '../components/SessionSubmitForm';
import SessionHistory from '../components/SessionHistory';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [refreshSessions, setRefreshSessions] = useState(false);

  const handleSessionSubmitted = () => {
    // Trigger refresh of session history and balance
    setRefreshSessions(!refreshSessions);
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
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;