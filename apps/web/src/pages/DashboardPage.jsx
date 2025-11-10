import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BalanceCard from '../components/BalanceCard';
import AutoMiner from '../components/AutoMiner';
import SessionHistory from '../components/SessionHistory';
import DirectorySection from '../components/DirectorySection';
import MiningStats from '../components/MiningStats';
import TutorialModal from '../components/TutorialModal';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [refreshSessions, setRefreshSessions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (user && user.hasSeenTutorial === false) {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, [user]);

  const handleSessionSubmitted = () => {
    setRefreshSessions(!refreshSessions);
  };

  return (
    <div className="container">
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2>Welcome, {user?.fullName || user?.username}! 👋</h2>
          <p>Start mining to earn PEPETOR with bonuses and multipliers!</p>
        </div>

        <MiningStats />

        <div className="sessions-section">
          <BalanceCard />
          <AutoMiner onSessionSubmitted={handleSessionSubmitted} />
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

        <DirectorySection />
      </div>
    </div>
  );
}

export default DashboardPage;