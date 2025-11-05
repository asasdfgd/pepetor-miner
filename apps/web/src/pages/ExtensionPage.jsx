import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ExtensionPage.css';

function ExtensionPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // Deployment trigger

  const handleDownload = () => {
    if (!isAuthenticated) {
      navigate('/register?redirect=extension');
    } else {
      // Download logic here
      console.log('Downloading extension...');
      // window.location.href = '/path-to-extension.crx';
    }
  };

  return (
    <div className="container">
      <div className="extension-page">
        {/* Header */}
        <section className="ext-header">
          <h1>PEPETOR-MINER Chrome Extension</h1>
          <p>The most lightweight browser extension for passive crypto earning</p>
        </section>

        {/* Main Download Section */}
        <section className="download-section card">
          <div className="download-content">
            <div className="download-info">
              <h2>Ready to Start Earning?</h2>
              <p className="version-info">
                <strong>Current Version:</strong> 1.0.5<br/>
                <strong>Supported Browsers:</strong> Chrome, Edge, Brave
              </p>
              
              <div className="specs">
                <h3>Specifications</h3>
                <ul>
                  <li>📦 Size: 4.8 MB</li>
                  <li>⚡ Memory: &lt;5 MB RAM usage</li>
                  <li>🔧 CPU Impact: &lt;0.5%</li>
                  <li>🔄 Auto-Updates: Yes</li>
                  <li>🔐 Permissions: Network, Data Storage</li>
                </ul>
              </div>

              <button onClick={handleDownload} className="btn btn-primary btn-lg">
                {isAuthenticated ? 'Download Now' : 'Create Account & Download'}
              </button>
              
              <p className="security-badge">
                ✓ Open Source • ✓ No Malware • ✓ Privacy Focused
              </p>
            </div>

            <div className="download-visual">
              <div className="extension-preview">
                <div className="preview-frame">
                  <div className="preview-title">PEPETOR</div>
                  <div className="preview-stats">
                    <div className="stat">
                      <div className="label">Earning</div>
                      <div className="value">$1.24</div>
                    </div>
                    <div className="stat">
                      <div className="label">Rate</div>
                      <div className="value">$0.15/h</div>
                    </div>
                  </div>
                  <button className="preview-btn">Mining...</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="extension-features card">
          <h2>Extension Features</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">⚙️</div>
              <h3>Auto-Start</h3>
              <p>Automatically starts mining when you launch your browser</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>Live Dashboard</h3>
              <p>Real-time earning stats and session tracking</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🚀</div>
              <h3>Turbo Mode</h3>
              <p>Boost earnings during peak hours (optional)</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⏯️</div>
              <h3>Easy Control</h3>
              <p>Pause/resume mining with one click</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💾</div>
              <h3>Low Impact</h3>
              <p>Minimal memory and CPU usage</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔔</div>
              <h3>Notifications</h3>
              <p>Get alerts when payouts are received</p>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="requirements card">
          <h2>System Requirements</h2>
          <div className="requirements-grid">
            <div className="req-box">
              <h3>Minimum</h3>
              <ul>
                <li>Chrome 90+</li>
                <li>2GB RAM</li>
                <li>10MB Storage</li>
                <li>1 Mbps Internet</li>
              </ul>
            </div>
            <div className="req-box">
              <h3>Recommended</h3>
              <ul>
                <li>Chrome Latest</li>
                <li>8GB RAM</li>
                <li>100MB Storage</li>
                <li>10+ Mbps Internet</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h4>Is the extension safe to install?</h4>
              <p>Yes! Our extension is open source and regularly audited by the community. We don't collect personal data, only bandwidth metrics for earnings calculations.</p>
            </div>
            <div className="faq-item">
              <h4>Will it slow down my browser?</h4>
              <p>No. The extension uses less than 5MB of RAM and under 0.5% CPU. You won't notice any performance impact during normal browsing.</p>
            </div>
            <div className="faq-item">
              <h4>Can I run multiple instances?</h4>
              <p>Yes! Install on multiple browsers or devices to multiply your earnings. Each device mines independently.</p>
            </div>
            <div className="faq-item">
              <h4>How do I update the extension?</h4>
              <p>Updates happen automatically. You'll get notifications when new versions are available with improvements and bug fixes.</p>
            </div>
            <div className="faq-item">
              <h4>What happens if I uninstall it?</h4>
              <p>Your earnings are safe in your account. You can reinstall anytime and continue from where you left off.</p>
            </div>
            <div className="faq-item">
              <h4>Which browsers are supported?</h4>
              <p>Currently Chrome, Edge, and Brave. Firefox support coming soon.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="extension-cta">
          <h2>Join Thousands of Miners Today</h2>
          <p>Download the extension and start earning passive income</p>
          <button onClick={handleDownload} className="btn btn-primary btn-lg">
            {isAuthenticated ? 'Download Extension' : 'Sign Up & Download'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default ExtensionPage;