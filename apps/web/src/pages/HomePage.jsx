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

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Get Started in 4 Steps</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up free. No email verification. Instant access.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Install Miner</h3>
              <p>Download the PepeTor browser extension from Chrome store</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Mining</h3>
              <p>Begin earning $PEPETOR. Create your first token. Trade on DEX.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Earn & Grow</h3>
              <p>Watch your balance grow. Refer friends. Upgrade your miner. Stake for rewards.</p>
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
