import { useState, useEffect } from 'react';
import { getClientSessions } from '../services/sessionService';
import './SessionHistory.css';

function SessionHistory({ refreshTrigger }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientSessions();
      setSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const errorMsg = err.message || err.error || (typeof err === 'string' ? err : 'Failed to fetch sessions');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    try {
      if (!isoString) return 'Unknown';
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch {
      return isoString || 'Unknown';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (session) => {
    if (session.signatureValid && session.heuristicsValid) {
      return 'valid';
    }
    if (session.signatureValid) {
      return 'warning';
    }
    return 'invalid';
  };

  const getStatusIcon = (session) => {
    if (session.signatureValid && session.heuristicsValid) {
      return '✅';
    }
    if (session.signatureValid) {
      return '⚠️';
    }
    return '❌';
  };

  const toggleExpand = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <div className="session-history-card">
      <div className="session-history-header">
        <h3>📋 Session History</h3>
        <button
          className="refresh-btn"
          onClick={fetchSessions}
          disabled={loading}
          title="Refresh sessions"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : error ? (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="no-sessions">
          <p>📭 No sessions submitted yet</p>
          <p className="hint">Submit a session above to see it here</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session._id || session.sessionId}
              className={`session-item ${getStatusColor(session)}`}
            >
              <div className="session-item-header">
                <div className="session-status">
                  <span className="status-icon">{getStatusIcon(session)}</span>
                  <span className="session-id">{session.sessionId}</span>
                </div>
                <button
                  className="expand-btn"
                  onClick={() => toggleExpand(session._id || session.sessionId)}
                >
                  {expandedSession === (session._id || session.sessionId) ? '▼' : '▶'}
                </button>
              </div>

              <div className="session-summary">
                <div className="summary-item">
                  <span className="label">Duration:</span>
                  <span className="value">{session.duration}s</span>
                </div>
                <div className="summary-item">
                  <span className="label">Data:</span>
                  <span className="value">{formatBytes(session.bytesTransferred)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Credits:</span>
                  <span className="value credits">{(session.creditsEarned || 0).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatDate(session.timestamp)}</span>
                </div>
              </div>

              {expandedSession === (session._id || session.sessionId) && (
                <div className="session-details">
                  <div className="detail-section">
                    <h4>Session Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Session ID:</span>
                        <code className="detail-value">{session.sessionId}</code>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">IP Hash:</span>
                        <code className="detail-value">{session.ipHash}</code>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{session.duration} seconds</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Data Transferred:</span>
                        <span className="detail-value">{formatBytes(session.bytesTransferred)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Validation Status</h4>
                    <div className="validation-grid">
                      <div className={`validation-item ${session.signatureValid ? 'valid' : 'invalid'}`}>
                        <span className="check">{session.signatureValid ? '✅' : '❌'}</span>
                        <span>Signature Valid</span>
                      </div>
                      <div className={`validation-item ${session.heuristicsValid ? 'valid' : 'invalid'}`}>
                        <span className="check">{session.heuristicsValid ? '✅' : '❌'}</span>
                        <span>Heuristics Valid</span>
                      </div>
                      <div className={`validation-item ${session.replayChecked ? 'valid' : 'warning'}`}>
                        <span className="check">{session.replayChecked ? '✅' : '⚠️'}</span>
                        <span>Replay Check</span>
                      </div>
                    </div>

                    {session.validationError && (
                      <div className="error-detail">
                        <strong>Validation Error:</strong> {session.validationError}
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Credits Calculation</h4>
                    <div className="credits-breakdown">
                      <div className="credit-item">
                        <span>Duration Credits (0.1/sec):</span>
                        <span className="amount">{((session.duration * 0.1) || 0).toFixed(2)}</span>
                      </div>
                      <div className="credit-item">
                        <span>Data Credits (0.5/MB):</span>
                        <span className="amount">{(((session.bytesTransferred / 1024 / 1024) * 0.5) || 0).toFixed(2)}</span>
                      </div>
                      <div className="credit-item total">
                        <span>Total Credits Earned:</span>
                        <span className="amount">{(session.creditsEarned || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionHistory;