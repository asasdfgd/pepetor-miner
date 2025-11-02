import { useState, useEffect } from 'react';
import api from '../services/api';
import './AutoSubmissionPanel.css';

function AutoSubmissionPanel() {
  const [monitoringStats, setMonitoringStats] = useState(null);
  const [submittedSessions, setSubmittedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetchMonitoringStats();
    const interval = setInterval(fetchMonitoringStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringStats = async () => {
    try {
      const statsResponse = await api.get('/tor/monitoring/stats');
      if (statsResponse.success) {
        setMonitoringStats(statsResponse.stats);
        setIsMonitoring(statsResponse.stats.isMonitoring);

        // Fetch submitted sessions
        const sessionsResponse = await api.get('/tor/monitoring/sessions?limit=20');
        if (sessionsResponse.success) {
          setSubmittedSessions(sessionsResponse.sessions || []);
        }
      }
    } catch (err) {
      console.error('Error fetching monitoring stats:', err);
    }
  };

  const handleStartMonitoring = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/tor/monitoring/start', {});

      if (response.success) {
        setMonitoringStats(response.stats);
        setIsMonitoring(true);
      } else {
        setError(response.error || 'Failed to start monitoring');
      }
    } catch (err) {
      setError(err.message || 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/tor/monitoring/stop', {});

      if (response.success) {
        setMonitoringStats(response.stats);
        setIsMonitoring(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auto-submission-card">
      <div className="auto-submission-header">
        <h3>🤖 Auto-Submission Monitoring</h3>
        <span className={`status-badge ${isMonitoring ? 'active' : 'inactive'}`}>
          {isMonitoring ? '🟢 ACTIVE' : '⚫ INACTIVE'}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {monitoringStats && (
        <div className="monitoring-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Sessions Submitted:</span>
              <span className="info-value">{monitoringStats.submittedSessions}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Credits:</span>
              <span className="info-value">{monitoringStats.totalCreditsEarned}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Accumulated Data:</span>
              <span className="info-value">{formatBytes(monitoringStats.accumulatedBytes)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Accumulated Time:</span>
              <span className="info-value">{monitoringStats.accumulatedSeconds}s</span>
            </div>
          </div>

          <div className="thresholds-info">
            <p>📋 <strong>Batch Thresholds:</strong></p>
            <ul>
              <li>Min Bytes: <span className="threshold-value">{formatBytes(monitoringStats.sessionBatchThreshold.minBytes)}</span></li>
              <li>Min Duration: <span className="threshold-value">{monitoringStats.sessionBatchThreshold.minDuration}s</span></li>
              <li>Max Duration: <span className="threshold-value">{monitoringStats.sessionBatchThreshold.maxDuration}s</span></li>
            </ul>
          </div>
        </div>
      )}

      <div className="control-buttons">
        {!isMonitoring ? (
          <button
            className="btn btn-primary"
            onClick={handleStartMonitoring}
            disabled={loading}
          >
            {loading ? '⏳ Starting...' : '▶️ Start Monitoring'}
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={handleStopMonitoring}
            disabled={loading}
          >
            {loading ? '⏳ Stopping...' : '⏹️ Stop Monitoring'}
          </button>
        )}
      </div>

      {submittedSessions.length > 0 && (
        <div className="submitted-sessions">
          <h4>📤 Auto-Submitted Sessions ({submittedSessions.length})</h4>
          <div className="sessions-list">
            {submittedSessions.slice().reverse().map((session, index) => (
              <div key={index} className="session-item">
                <div
                  className="session-summary"
                  onClick={() => setExpandedSession(expandedSession === index ? null : index)}
                >
                  <div className="session-main">
                    <span className="session-id">🔗 {session.sessionId?.substring(0, 12)}...</span>
                    <span className="session-data">{formatBytes(session.bytesTransferred)}</span>
                    <span className="session-duration">{session.duration}s</span>
                  </div>
                  <span className="expand-icon">{expandedSession === index ? '▼' : '▶'}</span>
                </div>

                {expandedSession === index && (
                  <div className="session-details">
                    <div className="detail-row">
                      <span className="detail-label">Session ID:</span>
                      <code className="detail-value">{session.sessionId}</code>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">{new Date(session.submittedAt).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Bytes:</span>
                      <span className="detail-value">{session.bytesTransferred}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{session.duration}s</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">IP Hash:</span>
                      <code className="detail-value">{session.ipHash}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {submittedSessions.length === 0 && isMonitoring && (
        <div className="no-sessions">
          ⏳ Waiting for Tor activity... Sessions will appear here when auto-submitted.
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default AutoSubmissionPanel;