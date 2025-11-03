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
            <h1 className="hero-title">Earn Crypto With Your Browser</h1>
            <p className="hero-subtitle">
              PEPETOR-MINER turns your unused browser bandwidth into real cryptocurrency rewards.
              Simple, secure, and profitable.
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
            <p className="hero-subtext">✨ No downloads needed • 100% free • Immediate payments</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose PEPETOR-MINER?</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">💰</div>
              <h3>Instant Payouts</h3>
              <p>Earn crypto directly to your wallet. Fast, transparent transactions with zero fees.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🔐</div>
              <h3>100% Secure</h3>
              <p>Military-grade encryption. Your data stays private. Built on blockchain technology.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">⚡</div>
              <h3>Zero Effort</h3>
              <p>Just install and forget. Works silently in the background while you browse.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🌍</div>
              <h3>Global Network</h3>
              <p>Join thousands of miners worldwide. The more people earn, the more you earn.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Stats</h3>
              <p>Track your earnings live. See exactly how much you're making every minute.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Device</h3>
              <p>Run on multiple devices simultaneously. Stack your earnings 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account in seconds</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Install Extension</h3>
              <p>Add our Chrome extension to your browser</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Earning</h3>
              <p>Mine crypto while you browse normally</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Withdraw</h3>
              <p>Withdraw to your wallet anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Showcase */}
      <section className="extension-showcase">
        <div className="container">
          <div className="showcase-content">
            <div className="showcase-text">
              <h2>Lightweight Chrome Extension</h2>
              <p>Our extension uses minimal resources and won't slow down your browsing. It's built with performance in mind.</p>
              <ul className="feature-list">
                <li>✓ Uses less than 5MB of RAM</li>
                <li>✓ Barely noticeable CPU usage</li>
                <li>✓ One-click installation</li>
                <li>✓ Auto-updates built in</li>
              </ul>
              <Link to="/extension" className="btn btn-primary">
                Download Extension Now
              </Link>
            </div>
            <div className="showcase-image">
              <div className="placeholder-box">🔧 Extension Preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2 className="section-title">Growing Community</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Active Miners</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$2.5M</div>
              <div className="stat-label">Total Paid Out</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">150+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="faq-teaser">
        <div className="container">
          <h2 className="section-title">Common Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Is it safe?</h4>
              <p>Yes. We use industry-standard encryption and never access personal data.</p>
            </div>
            <div className="faq-item">
              <h4>How much can I earn?</h4>
              <p>Earnings vary based on bandwidth. Most users earn $50-300/month.</p>
            </div>
            <div className="faq-item">
              <h4>Can I use multiple devices?</h4>
              <p>Yes! Stack earnings across computers and mobile devices.</p>
            </div>
            <div className="faq-item">
              <h4>When do I get paid?</h4>
              <p>Daily payouts. Withdraw anytime to your preferred wallet.</p>
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
          <h2>Ready to Start Earning?</h2>
          <p>Join thousands of miners making passive income today</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Earning Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
