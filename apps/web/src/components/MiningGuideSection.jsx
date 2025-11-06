import './MiningGuideSection.css';

function MiningGuideSection() {
  return (
    <div className="mining-guide-section">
      <div className="guide-header">
        <h2>How To Use Our Miners To Mine SOL Tokens</h2>
        <p className="guide-subtitle">Complete Guide to Earning $PEPETOR & SOL Rewards</p>
      </div>

      <div className="guide-container">
        <div className="guide-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Create or Connect Wallet</h3>
            <p>Users either:</p>
            <ul>
              <li>Create a new Solana wallet via Phantom, Backpack, or built-in web wallet</li>
              <li>Connect existing wallet securely through the PepeTor-Miner dashboard</li>
            </ul>
            <div className="info-box">
              <strong>Your wallet stores:</strong>
              <ul>
                <li>Your $PEPETOR mining rewards</li>
                <li>Custom memecoin tokens (if created)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Download & Install Extension</h3>
            <p>Available for Chrome, Brave, Edge, and Opera browsers.</p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Authenticates with your wallet</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Runs privacy-based mining in background</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Tracks active sessions and uptime</span>
              </div>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Log Into Dashboard</h3>
            <p>Visit <strong>clearnetlabs.fun</strong> and sign in via your wallet.</p>
            <div className="dashboard-preview">
              <p>The dashboard displays:</p>
              <ul>
                <li>Mining stats (uptime, credits, total earned)</li>
                <li>Token creation tools</li>
                <li>Referral and reward levels</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Start Mining Automatically</h3>
            <p>Once connected, the extension begins earning $PEPETOR as you browse.</p>
            <div className="mining-controls">
              <p className="mining-note">You can:</p>
              <ul>
                <li>Adjust performance or privacy settings</li>
                <li>Pause/resume mining anytime</li>
                <li>Track real-time earnings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">5</div>
          <div className="step-content">
            <h3>Claim Your Rewards</h3>
            <p>Rewards accumulate in your PepeTor-Miner balance.</p>
            <div className="reward-process">
              <ol>
                <li>Check your mining balance on the dashboard</li>
                <li>When threshold reached (0.01 SOL / 100 $PEPETOR), click "Claim Rewards"</li>
                <li>Approve transaction in your Solana wallet</li>
                <li>Rewards appear in your wallet in seconds</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">6</div>
          <div className="step-content">
            <h3>Create Custom Tokens (Advanced)</h3>
            <p>For advanced users:</p>
            <ul>
              <li>Create custom tokens via PepeTor-Miner tools</li>
              <li>Pay in $PEPETOR to deploy on Solana</li>
              <li>List on DexScreener or Clearnet Launchpad</li>
            </ul>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">7</div>
          <div className="step-content">
            <h3>Engage & Grow</h3>
            <p>Maximize your earnings:</p>
            <ul>
              <li>Invite friends with referral links</li>
              <li>Earn bonuses and mining multipliers</li>
              <li>Participate in governance or meme challenges</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="requirements-section">
        <h3>System Requirements</h3>
        <div className="requirements-grid">
          <div className="requirement-card">
            <h4>Minimum</h4>
            <ul>
              <li>CPU: Dual-core 1.6GHz</li>
              <li>RAM: 2 GB</li>
              <li>Storage: 200 MB</li>
              <li>Internet: 5 Mbps</li>
            </ul>
          </div>
          <div className="requirement-card">
            <h4>Recommended</h4>
            <ul>
              <li>CPU: Quad-core 2.5GHz+</li>
              <li>RAM: 4 GB+</li>
              <li>Storage: 500 MB+</li>
              <li>Internet: 10 Mbps+</li>
            </ul>
          </div>
          <div className="requirement-card">
            <h4>Supported Platforms</h4>
            <ul>
              <li>Windows 10/11 (64-bit)</li>
              <li>macOS 12+ (Monterey+)</li>
              <li>Linux (Ubuntu 20.04+)</li>
              <li>Android (coming soon)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="earnings-section">
        <h3>Earning Potential & APY</h3>
        <div className="earnings-grid">
          <div className="earnings-card">
            <h4>Base Earnings</h4>
            <p className="earnings-value">0.05 – 0.25 $PEPETOR/hour</p>
            <p className="earnings-detail">Example: 6 hrs/day ≈ 0.3 – 1.5 $PEPETOR daily</p>
          </div>
          <div className="earnings-card">
            <h4>Boosted Rewards</h4>
            <p className="earnings-value">2x – 5x Multiplier</p>
            <p className="earnings-detail">Via staking and referrals</p>
          </div>
          <div className="earnings-card">
            <h4>Standard APY</h4>
            <p className="earnings-value">20% – 45% APY</p>
            <p className="earnings-detail">Based on uptime & token value</p>
          </div>
          <div className="earnings-card premium">
            <h4>Premium APY</h4>
            <p className="earnings-value">60% – 120%+ APY</p>
            <p className="earnings-detail">Includes referrals & multipliers</p>
          </div>
        </div>
        <div className="earnings-note">
          <p><strong>⚠️ Disclaimer:</strong> Actual APY varies based on network activity, mining uptime, and market price of $PEPETOR & SOL.</p>
        </div>
      </div>

      <div className="tips-section">
        <h3>Pro Tips for Maximum Earnings</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">🚀</span>
            <h4>Stay Connected</h4>
            <p>Keep your browser open during mining sessions for maximum uptime and rewards</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📊</span>
            <h4>Monitor Stats</h4>
            <p>Check your dashboard regularly to track earnings and adjust settings</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">👥</span>
            <h4>Refer Friends</h4>
            <p>Invite others and earn referral bonuses plus boosted mining multipliers</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🔒</span>
            <h4>Secure Your Wallet</h4>
            <p>Never share your seed phrase and keep your wallet secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiningGuideSection;
