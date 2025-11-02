import { useState, useEffect } from 'react';
import api from '../services/api';
import './TorControlPanel.css';

function TorControlPanel() {
  const [torStatus, setTorStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSimulation, setUseSimulation] = useState(false);

  // Fetch Tor status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/tor/status');
        if (response.success) {
          setTorStatus(response);
        }
      } catch (err) {
        console.error('Error fetching Tor status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStartTor = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(useSimulation ? '/tor/simulate' : '/tor/start', {});

      if (response.success) {
        setTorStatus(response);
      } else {
        setError(response.error || 'Failed to start Tor');
      }
    } catch (err) {
      setError(err.error || 'Failed to start Tor');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTor = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = useSimulation ? '/tor/simulate/stop' : '/tor/stop';
      const response = await api.post(endpoint, {});

      if (response.success) {
        setTorStatus(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to stop Tor');
    } finally {
      setLoading(false);
    }
  };

  const isRunning = torStatus?.tor?.status === 'running' || (useSimulation && torStatus);

  return (
    <div className="tor-control-card">
      <div className="tor-header">
        <h3>🧅 Tor Control Center</h3>
        <span className={`status-badge ${isRunning ? 'running' : 'stopped'}`}>
          {isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tor-info">
        {isRunning && torStatus?.tor ? (
          <>
            <div className="info-row">
              <span className="info-label">SOCKS Port:</span>
              <span className="info-value">{torStatus.tor.socksPort}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Control Port:</span>
              <span className="info-value">{torStatus.tor.controlPort}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Uptime:</span>
              <span className="info-value">{formatUptime(torStatus.tor.uptime)}</span>
            </div>
          </>
        ) : (
          <div className="info-placeholder">
            {useSimulation ? '🎮 Ready to simulate Tor activity' : '⚙️ Tor is not running'}
          </div>
        )}
      </div>

      <div className="control-options">
        <label className="simulation-toggle">
          <input
            type="checkbox"
            checked={useSimulation}
            onChange={(e) => setUseSimulation(e.target.checked)}
            disabled={isRunning}
          />
          <span>🎮 Simulation Mode (test without Tor)</span>
        </label>
      </div>

      <div className="control-buttons">
        {!isRunning ? (
          <button
            className="btn btn-primary"
            onClick={handleStartTor}
            disabled={loading}
          >
            {loading ? '⏳ Starting...' : useSimulation ? '🎮 Start Simulation' : '🧅 Start Tor'}
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={handleStopTor}
            disabled={loading}
          >
            {loading ? '⏳ Stopping...' : '⏹️ Stop Tor'}
          </button>
        )}
      </div>

      {useSimulation && (
        <div className="simulation-info">
          💡 <strong>Simulation Mode:</strong> Generates mock Tor activity for testing
        </div>
      )}

      {!useSimulation && (
        <div className="tor-requirements">
          <p>📋 <strong>Requirements:</strong></p>
          <ul>
            <li>macOS: <code>brew install tor</code></li>
            <li>Linux: <code>apt-get install tor</code></li>
            <li>Windows: Download from torproject.org</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default TorControlPanel;