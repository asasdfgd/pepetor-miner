import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import TorControlPanel from '../components/TorControlPanel';
import TorStats from '../components/TorStats';
import AutoSubmissionPanel from '../components/AutoSubmissionPanel';
import './TorPage.css';

function TorPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(!refreshTrigger);
  };

  return (
    <div className="container">
      <div className="tor-page">
        <div className="page-header">
          <h1>🧅 Tor Integration & Monitoring</h1>
          <p>Control Tor process and monitor auto-session submissions</p>
        </div>

        <div className="tor-container">
          {/* Tor Control */}
          <section className="tor-section">
            <h2>Process Control</h2>
            <TorControlPanel />
          </section>

          {/* Activity Statistics */}
          <section className="tor-section">
            <h2>Activity Monitoring</h2>
            <TorStats refreshTrigger={refreshTrigger} />
          </section>

          {/* Auto-Submission */}
          <section className="tor-section">
            <h2>Auto-Submission System</h2>
            <AutoSubmissionPanel />
          </section>

          {/* Information Section */}
          <section className="info-section">
            <h3>📚 How It Works</h3>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">🧅</div>
                <h4>Tor Process</h4>
                <p>Starts a Tor instance on your machine. Use simulation mode for testing without installing Tor.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📊</div>
                <h4>Activity Monitoring</h4>
                <p>Tracks bandwidth in/out, active connections, and circuit information from your Tor session.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">🤖</div>
                <h4>Auto-Submission</h4>
                <p>Automatically converts Tor activity into session receipts and submits them to earn credits.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">💰</div>
                <h4>Rewards</h4>
                <p>Each session earns credits based on duration and data transferred. Track total earnings in real-time.</p>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section className="quickstart-section">
            <h3>⚡ Quick Start</h3>
            <div className="quickstart-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Start Tor or Simulation</h5>
                  <p>Click "Start Tor" or use "Simulation Mode" if Tor isn't installed</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Start Monitoring</h5>
                  <p>Enable auto-submission to watch for Tor activity and auto-submit sessions</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Watch Activity</h5>
                  <p>See real-time statistics and submitted sessions accumulate</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Earn Credits</h5>
                  <p>Credits appear in your balance as sessions are submitted</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="technical-section">
            <h3>🔧 Technical Details</h3>
            <div className="tech-content">
              <h5>Default Configuration</h5>
              <ul>
                <li><strong>SOCKS Port:</strong> 9050</li>
                <li><strong>Control Port:</strong> 9051</li>
                <li><strong>Min Batch Size:</strong> 100 KB</li>
                <li><strong>Min Duration:</strong> 30 seconds</li>
                <li><strong>Max Duration:</strong> 10 minutes</li>
              </ul>

              <h5>Environment Variables</h5>
              <pre>
{`TOR_SOCKS_PORT=9050
TOR_CONTROL_PORT=9051
TOR_LOG_LEVEL=warn`}
              </pre>

              <h5>Installation</h5>
              <ul>
                <li><strong>macOS:</strong> <code>brew install tor</code></li>
                <li><strong>Linux:</strong> <code>apt-get install tor</code></li>
                <li><strong>Windows:</strong> Download from torproject.org</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TorPage;