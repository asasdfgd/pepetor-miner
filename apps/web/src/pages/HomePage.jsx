import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">The First Web3 Platform Where Anyone Can Mine, Create & Trade Tokens</h1>
            <p className="hero-subtitle">
              ClearNetLabs brings privacy-first token mining and creation to everyone. Powered by PepeTor Miner — earn $PEPETOR and launch your own coins with absolute control.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Already Have Account?
                  </Link>
                </>
              )}
            </div>
            <p className="hero-subtext">🔒 Privacy First • 🚀 Token Creation • 💰 Mine & Trade • 24/7 Earnings</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose ClearNetLabs?</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🪙</div>
              <h3>Create Your Own Token</h3>
              <p>Deploy custom coins to Solana in 3 clicks. No code needed. Full control over supply, branding, and metadata.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">⛏️</div>
              <h3>Mine $PEPETOR</h3>
              <p>Privacy-focused mining. Earn tokens while browsing. Energy-light, reward-rich, contribution-based system.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy First</h3>
              <p>Zero tracking. Military-grade encryption. Your data never leaves your device. Your control, always.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📈</div>
              <h3>Trade Instantly</h3>
              <p>DEX integration with Raydium & Jupiter. Trade your tokens directly. Live price tracking via DEX Screener.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🏆</div>
              <h3>Leaderboards & Rewards</h3>
              <p>Compete with miners worldwide. Earn bonuses for volume, achievements, and referrals. Upgradeable nodes.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🌐</div>
              <h3>Powered by PepeTor</h3>
              <p>Built on the privacy coin philosophy. Decentralized. Transparent. Community-driven. Scalable forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="installation-guide">
        <div className="container">
          <h2 className="section-title">How to Install PepeTor Miner</h2>
          
          <div className="install-content">
            <h3>System Requirements</h3>
            <p>Before installing PepeTor Miner, ensure you have:</p>
            <ul className="requirements-list">
              <li>✓ Google Chrome or Chromium-based browser (v90+)</li>
              <li>✓ 50MB free disk space</li>
              <li>✓ Internet connection</li>
              <li>✓ Active ClearNetLabs account</li>
            </ul>

            <h3 style={{ marginTop: '2rem' }}>Installation Steps</h3>
            
            <div className="install-step">
              <h4>Step 1: Create Your Account</h4>
              <p>Visit ClearNetLabs and sign up for a free account. No email verification required — instant access to your dashboard.</p>
              <code>Visit: clearnetlabs.fun → Click "Get Started Free"</code>
            </div>

            <div className="install-step">
              <h4>Step 2: Download the Extension</h4>
              <p>Navigate to the Extension page and download the PepeTor Miner browser extension.</p>
              <code>Download: chrome-extension-v1.0.zip (4.8MB)</code>
              <p><strong>Or install directly from Chrome Web Store:</strong></p>
              <code>Search: "PepeTor Miner" in Chrome Web Store</code>
            </div>

            <div className="install-step">
              <h4>Step 3: Load Extension into Chrome</h4>
              <p>If downloading manually (not from Web Store):</p>
              <ol className="code-steps">
                <li>Extract the downloaded ZIP file to a folder</li>
                <li>Open Chrome and go to <code>chrome://extensions/</code></li>
                <li>Enable "Developer mode" (toggle in top right)</li>
                <li>Click "Load unpacked" and select the extracted folder</li>
                <li>The PepeTor Miner extension should appear in your Chrome toolbar</li>
              </ol>
            </div>

            <div className="install-step">
              <h4>Step 4: Authenticate & Start Mining</h4>
              <p>Click the PepeTor Miner extension icon in your toolbar:</p>
              <ol className="code-steps">
                <li>Log in with your ClearNetLabs credentials</li>
                <li>Review the privacy settings (enabled by default)</li>
                <li>Click "Start Mining" to begin earning $PEPETOR</li>
                <li>Monitor your earnings in real-time on the dashboard</li>
              </ol>
            </div>

            <div className="install-step">
              <h4>Step 5: Manage Your Miner</h4>
              <p>Once mining, you can:</p>
              <ul className="features-list-inline">
                <li>✓ Pause/resume mining anytime</li>
                <li>✓ Set power limits (CPU, network)</li>
                <li>✓ View hourly earnings</li>
                <li>✓ Withdraw to wallet</li>
                <li>✓ Create and trade tokens</li>
              </ul>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Troubleshooting</h3>
            
            <div className="troubleshooting">
              <div className="trouble-item">
                <h5>Extension won't load</h5>
                <p>Ensure Developer mode is enabled and path is correct. Try restarting Chrome.</p>
              </div>
              <div className="trouble-item">
                <h5>Mining isn't starting</h5>
                <p>Check your internet connection and verify your account is active on clearnetlabs.fun</p>
              </div>
              <div className="trouble-item">
                <h5>Low hash rate</h5>
                <p>This is normal. Mining adjusts based on your network. Earnings increase with network growth.</p>
              </div>
              <div className="trouble-item">
                <h5>Browser running slow</h5>
                <p>PepeTor uses &lt;5MB RAM. Check other extensions or reduce browser tabs.</p>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Next Steps</h3>
            <p>After installation:</p>
            <ol className="next-steps-list">
              <li>Let the miner run for 1 hour to accumulate earnings</li>
              <li>Create your first custom token on the Dashboard</li>
              <li>Trade your $PEPETOR on Raydium or Jupiter DEX</li>
              <li>Refer friends to earn bonus rewards</li>
              <li>Upgrade to premium miner for 2x earnings</li>
            </ol>

            <div className="support-box">
              <h4>Need Help?</h4>
              <p>Join our community Discord or email support@clearnetlabs.fun</p>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Showcase */}
      <section className="extension-showcase">
        <div className="container">
          <div className="showcase-content">
            <div className="showcase-text">
              <h2>PepeTor Mining Extension</h2>
              <p>Mine privately while you work, study, or relax. Our lightweight extension runs seamlessly in the background with zero impact on your browsing experience.</p>
              <ul className="feature-list">
                <li>✓ <strong>&lt;5MB RAM</strong> — Won't slow you down</li>
                <li>✓ <strong>Privacy Mode ON</strong> — Zero tracking, zero logs</li>
                <li>✓ <strong>One-Click Setup</strong> — Start mining instantly</li>
                <li>✓ <strong>Auto-Optimize</strong> — Adjusts to your network speed</li>
                <li>✓ <strong>Earn Passively</strong> — Works 24/7 while you sleep</li>
              </ul>
              <Link to="/extension" className="btn btn-primary">
                Get Mining Now
              </Link>
            </div>
            <div className="showcase-image">
              <div className="placeholder-box">⚙️ Extension Preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2 className="section-title">Trusted by the Community</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">42K+</div>
              <div className="stat-label">Active Miners</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">12.5M</div>
              <div className="stat-label">$PEPETOR Mined</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1,240+</div>
              <div className="stat-label">Tokens Launched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">174</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="faq-teaser">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Is My Data Private?</h4>
              <p>100% yes. Zero tracking, military-grade encryption, and your data never leaves your device.</p>
            </div>
            <div className="faq-item">
              <h4>How Much Can I Mine?</h4>
              <p>Earnings depend on your hash rate and network participation. Early miners earn $100-500/month.</p>
            </div>
            <div className="faq-item">
              <h4>Can I Create Multiple Tokens?</h4>
              <p>Yes! Create unlimited tokens on Solana. Each token can have its own community and trading pair.</p>
            </div>
            <div className="faq-item">
              <h4>How Do Payouts Work?</h4>
              <p>Automatic daily payouts. Withdraw $PEPETOR or your custom tokens directly to Phantom, Magic Eden, or any Solana wallet.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/faq" className="btn btn-secondary">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Join the Privacy Revolution</h2>
          <p>Start mining $PEPETOR today. Create tokens. Trade freely. Earn passively. 24/7.</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Begin Mining Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
