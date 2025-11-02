import { useState } from 'react';
import { submitSession, generateMockSession } from '../services/sessionService';
import './SessionSubmitForm.css';

function SessionSubmitForm({ onSessionSubmitted }) {
  const [formData, setFormData] = useState({
    duration: '45',
    bytesTransferred: '5000',
    ipHash: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateMockIpHash = () => {
    return `hash_${Math.random().toString(36).substr(2, 12)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      const duration = parseInt(formData.duration);
      const bytesTransferred = parseInt(formData.bytesTransferred);

      if (duration < 1 || duration > 3600) {
        throw new Error('Duration must be between 1 and 3600 seconds');
      }

      if (bytesTransferred < 1024 || bytesTransferred > 1000000) {
        throw new Error('Bytes transferred must be between 1,024 (1KB) and 1,000,000 bytes');
      }

      // Create session data
      const sessionData = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        duration,
        bytesTransferred,
        ipHash: formData.ipHash || generateMockIpHash(),
      };

      // Submit session
      const response = await submitSession(sessionData);

      if (response.success || response.credits !== undefined) {
        setSuccess(
          `✅ Session submitted successfully! Credits earned: ${(response.credits || 0).toFixed(2)}`
        );
        setFormData({
          duration: '45',
          bytesTransferred: '5000',
          ipHash: '',
        });

        // Notify parent component
        if (onSessionSubmitted) {
          onSessionSubmitted(response);
        }

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Error submitting session:', err);
      setError(err.message || 'Failed to submit session');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = (preset) => {
    setFormData({
      duration: preset.duration.toString(),
      bytesTransferred: preset.bytesTransferred.toString(),
      ipHash: '',
    });

    // Auto-submit after setting form
    setTimeout(() => {
      const form = document.querySelector('.session-form');
      form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  return (
    <div className="session-submit-card">
      <div className="session-card-header">
        <h3>📤 Submit Session</h3>
        <span className="badge-info">Earn Credits</span>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="session-form">
        <div className="form-section">
          <h4>Session Details</h4>

          <div className="form-group">
            <label htmlFor="duration">
              Duration (seconds) ⏱️
              <span className="helper-text">Min: 1, Max: 3600</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              min="1"
              max="3600"
              value={formData.duration}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bytesTransferred">
              Data Transferred (bytes) 📊
              <span className="helper-text">Min: 1,024 (1KB), Max: 1,000,000</span>
            </label>
            <input
              type="number"
              id="bytesTransferred"
              name="bytesTransferred"
              min="1024"
              max="1000000"
              value={formData.bytesTransferred}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {showAdvanced && (
            <div className="form-group">
              <label htmlFor="ipHash">
                IP Hash (optional) 🔒
                <span className="helper-text">Auto-generated if empty</span>
              </label>
              <input
                type="text"
                id="ipHash"
                name="ipHash"
                value={formData.ipHash}
                onChange={handleInputChange}
                placeholder="hash_example123"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
        </div>

        <div className="form-section">
          <h4>Quick Presets</h4>
          <div className="preset-buttons">
            <button
              type="button"
              className="preset-btn light"
              onClick={() => handleQuickSubmit({ duration: 30, bytesTransferred: 1024 })}
              disabled={loading}
              title="Light session: 30s, 1KB"
            >
              💡 Light (30s, 1KB)
            </button>
            <button
              type="button"
              className="preset-btn medium"
              onClick={() => handleQuickSubmit({ duration: 120, bytesTransferred: 10000 })}
              disabled={loading}
              title="Medium session: 120s, 10KB"
            >
              ⚡ Medium (120s, 10KB)
            </button>
            <button
              type="button"
              className="preset-btn heavy"
              onClick={() => handleQuickSubmit({ duration: 300, bytesTransferred: 50000 })}
              disabled={loading}
              title="Heavy session: 300s, 50KB"
            >
              🚀 Heavy (300s, 50KB)
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✉️ Submit Session'}
          </button>
        </div>

        <div className="session-info">
          <p>💡 <strong>How it works:</strong></p>
          <ul>
            <li>Sessions are cryptographically signed with your client key</li>
            <li>Minimum session: 10 seconds, 1 KB data</li>
            <li>Credits: 0.1/second + 0.5/MB (max 100/session)</li>
            <li>Each session gets a unique ID to prevent replay attacks</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

export default SessionSubmitForm;