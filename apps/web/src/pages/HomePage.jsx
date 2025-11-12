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

      {/* What Makes ClearNetLabs Different */}
      <section className="differentiators">
        <div className="container">
          <h2 className="section-title">🔥 What Makes ClearNetLabs Different</h2>
          
          <div className="diff-intro">
            <p>
              PepeTor isn't just another meme-coin exchange. It's a <strong>creation engine</strong> for the next generation of Web3 users. 
              While other platforms focus on trading hype, PepeTor focuses on building <strong>ecosystems</strong> — giving anyone the power to create, mine, and trade their own coins in one place.
            </p>
          </div>

          <div className="diff-points">
            <div className="diff-point">
              <div className="diff-number">1</div>
              <div className="diff-content">
                <h3>It's Not Just an Exchange — It's a Creator Platform</h3>
                <p>
                  Most meme-coin sites only let you buy or sell. PepeTor lets you <strong>launch your own token</strong>, <strong>mine it</strong>, and list it from the same dashboard. 
                  You don't need to code, manage liquidity, or pay for third-party services. Everything is automated and built around simplicity.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">2</div>
              <div className="diff-content">
                <h3>Mining Meets Memecoins</h3>
                <p>
                  Traditional mining wastes energy. PepeTor flips that.<br/>
                  Users earn <strong>$PEPETOR for active uptime</strong> — by running sessions, maintaining private connections, or using the Tor network. 
                  You can even let others mine the tokens you create, turning your coin into a living, community-driven economy.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">3</div>
              <div className="diff-content">
                <h3>Privacy Comes First (Tor Integration)</h3>
                <p>
                  ClearNetLabs started with one mission: make privacy profitable.<br/>
                  The built-in <strong>Tor system</strong> anonymizes user traffic and rewards private participation. No trackers. No middlemen. 
                  Just pure peer-to-peer activity where your data stays yours.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">4</div>
              <div className="diff-content">
                <h3>Smart Bonding-Curve Launches</h3>
                <p>
                  PepeTor uses a <strong>pump.fun-style bonding curve</strong> for every token — but adds real utility on top.<br/>
                  Each curve connects to mining and liquidity systems, so when a token "graduates," it automatically deploys to Raydium. 
                  That means fair pricing, real volume, and no manual setup headaches.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">5</div>
              <div className="diff-content">
                <h3>Early Liquidity Commitments</h3>
                <p>
                  Before a token even launches, users can <strong>pledge SOL</strong> to back it.<br/>
                  When the pool goes live, those early pledges become automatic liquidity, and backers get LP tokens plus fee shares. 
                  It's like early-stage investing for the meme economy — transparent, fair, and community-powered.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">6</div>
              <div className="diff-content">
                <h3>Gamified Mining System</h3>
                <p>
                  Mining on PepeTor feels like a game.<br/>
                  You get <strong>uptime multipliers</strong>, <strong>daily streak bonuses</strong>, and <strong>reward tiers</strong> that make earning fun instead of technical. 
                  It keeps the platform alive with constant engagement and community competition.
                </p>
              </div>
            </div>

            <div className="diff-point">
              <div className="diff-number">7</div>
              <div className="diff-content">
                <h3>Real Rewards for Creators</h3>
                <p>
                  Token creators earn a percentage of fees from trading, mining, and volume their tokens generate.<br/>
                  Instead of launching and walking away, they're motivated to grow their community — creating a <strong>self-sustaining feedback loop</strong> where both sides win.
                </p>
              </div>
            </div>
          </div>

          <div className="diff-table-section">
            <h3 className="table-title">TL;DR</h3>
            <div className="comparison-table">
              <div className="table-row table-header">
                <div className="table-cell">Feature</div>
                <div className="table-cell">ClearNetLabs</div>
                <div className="table-cell">Typical Meme-Coin Platform</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Token Creation</div>
                <div className="table-cell success">✅ One-click creation</div>
                <div className="table-cell fail">❌ Requires coding</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Mining</div>
                <div className="table-cell success">✅ Built-in passive system</div>
                <div className="table-cell fail">❌ None</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Privacy Layer</div>
                <div className="table-cell success">✅ Tor integration</div>
                <div className="table-cell fail">❌ Trackable activity</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Early Liquidity</div>
                <div className="table-cell success">✅ Pre-migration pledges</div>
                <div className="table-cell fail">❌ Manual setup</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Gamified Rewards</div>
                <div className="table-cell success">✅ Yes</div>
                <div className="table-cell fail">❌ No</div>
              </div>
              <div className="table-row">
                <div className="table-cell">Ecosystem Focus</div>
                <div className="table-cell success">✅ Build, Mine, Trade</div>
                <div className="table-cell fail">❌ Trade only</div>
              </div>
            </div>
          </div>

          <div className="diff-closing">
            <p>
              <strong>PepeTor isn't another project riding the meme wave</strong> — it's building the infrastructure for it.<br/>
              A place where you can create value out of none, anywhere, anyone, and create value out of privacy, creativity, and community.
            </p>
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

      {/* Mining Features Showcase */}
      <section className="extension-showcase">
        <div className="container">
          <div className="showcase-content">
            <div className="showcase-text">
              <h2>⛏️ Start Mining $PEPETOR Now</h2>
              <p>Web-based mining is live! Log in to your dashboard and start earning $PEPETOR automatically. No downloads, no configuration required.</p>
              <ul className="feature-list">
                <li>✓ <strong>Auto-Start</strong> — Mining begins on login</li>
                <li>✓ <strong>Privacy Mode ON</strong> — Zero tracking, zero logs</li>
                <li>✓ <strong>30-Min Sessions</strong> — Automatic submission</li>
                <li>✓ <strong>2-Hour Cycles</strong> — Restart anytime</li>
                <li>✓ <strong>Earn Passively</strong> — Keep tab open, earn rewards</li>
              </ul>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard & Mine
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
              )}
            </div>
            <div className="showcase-image">
              <div className="placeholder-box">⛏️ Mining Dashboard</div>
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
              <p>Absolutely. Zero tracking, military-grade encryption via Tor integration. Your data never leaves your device.</p>
            </div>
            <div className="faq-item">
              <h4>What Can I Do Right Now?</h4>
              <p>Create tokens, start mining $PEPETOR automatically, trade on Raydium, and earn passive rewards 24/7.</p>
            </div>
            <div className="faq-item">
              <h4>Can I Create Multiple Tokens?</h4>
              <p>Yes! Deploy unlimited tokens with bonding curves, custom branding, and automatic Raydium migration.</p>
            </div>
            <div className="faq-item">
              <h4>How Does Mining Work?</h4>
              <p>Auto-mining starts when you log in. Earn $PEPETOR for uptime, sessions run every 30 minutes, auto-stop after 2 hours.</p>
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
                <h3>Joe</h3>
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
                  After leaving my job, I started exploring ways to make money online. 
                  Trading meme coins seemed promising—until it wasn't. That's when the idea struck...
                </p>
                <p className="about-highlight">
                  What if you could <strong>create, mine, AND trade tokens</strong> all in one place?
                </p>
                <p>
                  ClearNetLabs was born from that vision. A platform where anyone can launch their own token with bonding curves, 
                  mine passively with privacy protection, and trade on live DEX markets—no code, no barriers, just pure opportunity.
                </p>
                <p className="about-mission">
                  🚀 Built by a 17-year-old who turned failure into innovation. The platform is live. Join the revolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Create, Mine & Trade?</h2>
          <p>Launch tokens with bonding curves. Mine $PEPETOR automatically. Trade on Raydium. All in one platform. Start now.</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free — Start Mining
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
