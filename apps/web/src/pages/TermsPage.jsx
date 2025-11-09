import './LegalPage.css';

function TermsPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: November 9, 2024</p>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using ClearNetLabs ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Service Description</h2>
          <p>
            ClearNetLabs is a decentralized token creation platform that allows users to:
          </p>
          <ul>
            <li>Create custom SPL tokens on the Solana blockchain</li>
            <li>Deploy tokens with customizable parameters</li>
            <li>Receive wallet keypairs for token management</li>
          </ul>
          <p>
            The Platform is provided "as-is" and we make no guarantees about token performance, market value, or adoption.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. User Responsibilities</h2>
          <p>You are solely responsible for:</p>
          <ul>
            <li><strong>Token Creation:</strong> All tokens you create, including their legality, compliance, and use</li>
            <li><strong>Security:</strong> Safeguarding your wallet private keys and token keypairs</li>
            <li><strong>Compliance:</strong> Ensuring your token complies with all applicable laws and regulations</li>
            <li><strong>Due Diligence:</strong> Researching and understanding cryptocurrency risks before creating or trading tokens</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Prohibited Activities</h2>
          <p>You may NOT use the Platform to:</p>
          <ul>
            <li>Create tokens that violate securities laws or regulations</li>
            <li>Deploy fraudulent, misleading, or scam tokens</li>
            <li>Infringe on intellectual property rights (trademarks, copyrights)</li>
            <li>Create tokens for illegal purposes or money laundering</li>
            <li>Impersonate other projects or deceive users</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Fees and Payments</h2>
          <ul>
            <li><strong>Deployment Fee:</strong> $10 USD worth of SOL (or equivalent in PEPETOR)</li>
            <li><strong>Non-Refundable:</strong> All payments are final and non-refundable</li>
            <li><strong>Gas Fees:</strong> Users are responsible for Solana network transaction fees</li>
            <li><strong>Third-Party Fees:</strong> Additional fees may apply for market creation and liquidity pools</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. No Financial Advice</h2>
          <p>
            <strong>ClearNetLabs does NOT provide financial, investment, or legal advice.</strong> 
            The Platform is a technical tool. You are solely responsible for your own investment decisions. 
            Cryptocurrency investments carry significant risk, including total loss of capital.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, ClearNetLabs and its creators are NOT liable for:
          </p>
          <ul>
            <li>Loss of funds due to user error or wallet compromise</li>
            <li>Token value depreciation or market performance</li>
            <li>Smart contract bugs or blockchain network issues</li>
            <li>Third-party service failures (Solana, Raydium, OpenBook, etc.)</li>
            <li>Regulatory actions or legal consequences related to your token</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Intellectual Property</h2>
          <p>
            The ClearNetLabs platform code is open-source under the MIT license. 
            Users retain ownership of tokens they create but must respect third-party intellectual property rights.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to the Platform at any time, 
            for any reason, including violation of these Terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Platform after changes 
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which the Platform operator resides. 
            Any disputes will be resolved through binding arbitration.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>
            For questions about these Terms, contact: <strong>qeradad2@gmail.com</strong>
          </p>
        </section>

        <div className="legal-footer">
          <p><strong>⚠️ Important:</strong> By using ClearNetLabs, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
