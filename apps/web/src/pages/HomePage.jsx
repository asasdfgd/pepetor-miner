import React from 'react';
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

      {/* Extension Showcase - Installation Guide Removed */}
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
              <button className="btn btn-primary" disabled style={{opacity: 0.6, cursor: 'not-allowed'}}>
                Coming Soon
              </button>
            </div>
            <div className="showcase-image">
              <div className="placeholder-box">⚙️ Extension Preview</div>
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
              <p>Privacy is a core value of ClearNetLabs. We're building with privacy-first principles in mind.</p>
            </div>
            <div className="faq-item">
              <h4>What Can I Do Right Now?</h4>
              <p>Currently, you can create custom tokens on Solana. Mining is coming soon.</p>
            </div>
            <div className="faq-item">
              <h4>Can I Create Multiple Tokens?</h4>
              <p>Yes! Create custom tokens on Solana. Each token can be configured with your own parameters.</p>
            </div>
            <div className="faq-item">
              <h4>When Will Mining Launch?</h4>
              <p>We're actively developing the mining platform. Check back soon for updates on the launch.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/faq" className="btn btn-secondary">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">About the Creator</h2>
          <div className="about-content">
            <div className="about-story">
              <div className="about-header">
                <h3>Joseph Pietravalle</h3>
                <a 
                  href="https://x.com/clearnetmoney" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="about-social"
                >
                  <span className="social-icon">𝕏</span> @clearnetmoney
                </a>
              </div>
              <div className="about-text">
                <p>
                  I left my job and found myself scanning the internet for ways to make money. 
                  I started trading meme coins—that didn't go too well. Then it hit me...
                </p>
                <p className="about-highlight">
                  What if there could be a platform that allows users to <strong>trade tokens and mine them as well</strong>?
                </p>
                <p>
                  That's how ClearNetLabs was born. A place where anyone can create their own token, 
                  mine crypto, and trade—all in one platform. No gatekeepers, no barriers, just pure opportunity.
                </p>
                <p className="about-mission">
                  🚀 Built by a 17-year-old who turned setbacks into innovation. Join the revolution.
                </p>
              </div>
            </div>
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
