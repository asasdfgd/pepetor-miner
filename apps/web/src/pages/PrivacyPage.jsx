import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: November 9, 2024</p>

        <section className="legal-section">
          <h2>1. Our Commitment to Privacy</h2>
          <p>
            ClearNetLabs is built on the principle of <strong>privacy-first</strong> technology. 
            We collect minimal data and never sell or share your personal information with third parties.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Wallet Information</h3>
          <ul>
            <li><strong>Public Wallet Address:</strong> Used for authentication and associating token deployments with your account</li>
            <li><strong>Transaction Signatures:</strong> Payment verification for token deployment fees</li>
          </ul>
          <p className="privacy-note">
            ℹ️ We do NOT collect or store your private keys, seed phrases, or passwords.
          </p>

          <h3>2.2 Token Deployment Data</h3>
          <ul>
            <li>Token name, symbol, and metadata you provide</li>
            <li>Deployment timestamps and status</li>
            <li>Generated wallet addresses (treasury, rewards, liquidity, marketing)</li>
          </ul>

          <h3>2.3 Technical Data</h3>
          <ul>
            <li>IP addresses (server logs, automatically deleted after 7 days)</li>
            <li>Browser type and device information</li>
            <li>Usage analytics (anonymized)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>Your data is used solely to:</p>
          <ul>
            <li>Authenticate your wallet and provide access to the Platform</li>
            <li>Process token deployments and display your deployment history</li>
            <li>Prevent fraud and abuse</li>
            <li>Improve platform performance and user experience</li>
            <li>Communicate important updates (security, service changes)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Storage and Security</h2>
          
          <h3>4.1 Encryption</h3>
          <ul>
            <li>All data transmitted over HTTPS with SSL/TLS encryption</li>
            <li>Wallet keypairs stored encrypted in our database</li>
            <li>Passwords hashed using bcrypt (not stored in plaintext)</li>
          </ul>

          <h3>4.2 Data Retention</h3>
          <ul>
            <li><strong>Deployment Records:</strong> Stored indefinitely for your reference</li>
            <li><strong>Logs:</strong> Automatically deleted after 7 days</li>
            <li><strong>Account Data:</strong> Retained until you request deletion</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Third-Party Services</h2>
          <p>
            ClearNetLabs integrates with the following third-party services. 
            Please review their privacy policies:
          </p>
          <ul>
            <li><strong>Solana Blockchain:</strong> Public ledger (all transactions visible on-chain)</li>
            <li><strong>Phantom/Solflare Wallets:</strong> Wallet connection via official adapters</li>
            <li><strong>Irys (Arweave):</strong> Metadata storage for token logos and metadata</li>
            <li><strong>CoinGecko API:</strong> Real-time SOL pricing</li>
          </ul>
          <p className="privacy-note">
            ℹ️ We do NOT control or have access to data collected by these third parties.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Cookies and Tracking</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Session management and authentication (required)</li>
            <li><strong>Analytics:</strong> Anonymized usage data to improve the Platform (optional)</li>
            <li><strong>No Advertising Cookies:</strong> We do NOT use tracking for ads or marketing</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Your Privacy Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Deletion:</strong> Request permanent deletion of your account and data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Opt-Out:</strong> Disable non-essential analytics cookies</li>
          </ul>
          <p>
            To exercise these rights, contact: <strong>qeradad2@gmail.com</strong>
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Children's Privacy</h2>
          <p>
            ClearNetLabs is NOT intended for users under 18 years of age. 
            We do not knowingly collect data from minors. If you are under 18, 
            please do not use the Platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. International Users</h2>
          <p>
            If you are accessing ClearNetLabs from outside the United States, 
            you consent to the transfer and processing of your data in the U.S. 
            We comply with GDPR and CCPA where applicable.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page 
            with an updated "Last Updated" date. Continued use of the Platform after changes 
            constitutes acceptance.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Contact Us</h2>
          <p>
            For privacy-related questions or requests, contact:
          </p>
          <p><strong>Email:</strong> qeradad2@gmail.com</p>
          <p><strong>GitHub:</strong> <a href="https://github.com/asasdfgd/pepetor-miner" target="_blank" rel="noopener noreferrer">github.com/asasdfgd/pepetor-miner</a></p>
        </section>

        <div className="legal-footer">
          <p><strong>🔒 Privacy Guarantee:</strong> We will never sell your data to third parties. Your privacy is our top priority.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
