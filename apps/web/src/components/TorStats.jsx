import { useState, useEffect } from 'react';
import api from '../services/api';
import './TorStats.css';

function TorStats({ refreshTrigger = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tor/status');

      if (response.success) {
        setStats(response);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching Tor stats:', err);
      setError('Unable to fetch Tor statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!stats?.tor) {
    return (
      <div className="tor-stats-card">
        <div className="stats-message">⏸️ Start Tor to view statistics</div>
      </div>
    );
  }

  return (
    <div className="tor-stats-card">
      <div className="stats-header">
        <h3>📊 Activity Statistics</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-icon">📥</span>
          <span className="stat-label">Data In</span>
          <span className="stat-value">{formatBytes(stats.stats?.bytesIn || 0)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-icon">📤</span>
          <span className="stat-label">Data Out</span>
          <span className="stat-value">{formatBytes(stats.stats?.bytesOut || 0)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-icon">📊</span>
          <span className="stat-label">Total Data</span>
          <span className="stat-value">{formatBytes(stats.stats?.totalBytes || 0)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-icon">🔌</span>
          <span className="stat-label">Connections</span>
          <span className="stat-value">{stats.stats?.connectionCount || 0}</span>
        </div>

        <div className="stat-box">
          <span className="stat-icon">🛣️</span>
          <span className="stat-label">Circuits</span>
          <span className="stat-value">{stats.stats?.circuitCount || 0}</span>
        </div>

        <div className="stat-box">
          <span className="stat-icon">⏱️</span>
          <span className="stat-label">Session Time</span>
          <span className="stat-value">{formatTime(stats.tor?.uptime || 0)}</span>
        </div>
      </div>

      {stats.autoSubmission && (
        <div className="auto-submission-stats">
          <h4>🤖 Auto-Submission Progress</h4>
          <div className="progress-container">
            <div className="progress-row">
              <span className="progress-label">Accumulated Data:</span>
              <span className="progress-value">
                {formatBytes(stats.autoSubmission.accumulatedBytes)} / 100 KB
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min((stats.autoSubmission.accumulatedBytes / 100000) * 100, 100)}%` }}
              />
            </div>

            <div className="progress-row">
              <span className="progress-label">Time Accumulated:</span>
              <span className="progress-value">
                {stats.autoSubmission.accumulatedSeconds}s / 30s
              </span>
            </div>

            <div className="progress-row">
              <span className="progress-label">Sessions Submitted:</span>
              <span className="progress-value">{stats.autoSubmission.submittedSessions}</span>
            </div>

            <div className="progress-row">
              <span className="progress-label">Total Credits Earned:</span>
              <span className="progress-value credits">{stats.autoSubmission.totalCreditsEarned}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default TorStats;