import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import './DeployTokenPage.css';

const DeployTokenPage = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '1000000000',
    decimals: '9',
    description: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentId, setDeploymentId] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [paymentSignature, setPaymentSignature] = useState(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    if (deploymentId) {
      const interval = setInterval(() => {
        checkDeploymentStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [deploymentId]);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token-deployment/price`);
      const data = await response.json();
      if (data.success) {
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file must be less than 5MB');
        return;
      }
      if (!file.type.match(/^image\/(png|jpeg)$/)) {
        setError('Logo must be PNG or JPEG');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const sendPayment = async () => {
    if (!publicKey || !pricing) return null;

    try {
      const treasuryPubkey = new PublicKey(pricing.treasuryWallet);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: pricing.price * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Payment failed:', error);
      throw new Error('Payment failed: ' + error.message);
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    setError(null);
    setDeploying(true);

    try {
      if (!publicKey) {
        throw new Error('Please connect your wallet');
      }

      const signature = await sendPayment();
      if (!signature) {
        throw new Error('Payment failed');
      }

      setPaymentSignature(signature);

      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('tokenName', formData.tokenName);
      formDataToSend.append('tokenSymbol', formData.tokenSymbol);
      formDataToSend.append('totalSupply', formData.totalSupply);
      formDataToSend.append('decimals', formData.decimals);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('paymentSignature', signature);
      formDataToSend.append('paymentMethod', 'SOL');
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token-deployment/deploy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Deployment failed');
      }

      setDeploymentId(data.deploymentId);
    } catch (error) {
      console.error('Deployment error:', error);
      setError(error.message);
    } finally {
      setDeploying(false);
    }
  };

  const checkDeploymentStatus = async () => {
    if (!deploymentId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/token-deployment/status/${deploymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setDeploymentStatus(data.deployment);
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  if (deploymentStatus && deploymentStatus.status === 'deployed') {
    return (
      <div className="deploy-token-page">
        <div className="deploy-success">
          <h1>🎉 Token Deployed Successfully!</h1>
          
          <div className="token-details">
            <h2>{deploymentStatus.tokenName} (${deploymentStatus.tokenSymbol})</h2>
            
            <div className="detail-item">
              <label>Mint Address:</label>
              <code>{deploymentStatus.mintAddress}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(deploymentStatus.mintAddress)}
                className="copy-btn"
              >
                Copy
              </button>
            </div>

            <div className="detail-item">
              <label>Treasury Wallet:</label>
              <code>{deploymentStatus.treasuryWallet}</code>
            </div>

            <div className="detail-item">
              <label>Rewards Wallet:</label>
              <code>{deploymentStatus.rewardsWallet}</code>
            </div>

            <div className="detail-item">
              <label>Liquidity Wallet:</label>
              <code>{deploymentStatus.liquidityWallet}</code>
            </div>

            <div className="detail-item">
              <label>Total Supply:</label>
              <span>{deploymentStatus.totalSupply.toLocaleString()} tokens</span>
            </div>

            <div className="next-steps">
              <h3>📋 Next Steps:</h3>
              <ol>
                <li>✅ Token deployed on Solana {deploymentStatus.network}</li>
                <li>Upload logo and metadata (coming soon)</li>
                <li>Create Raydium liquidity pool</li>
                <li>Lock LP tokens</li>
                <li>List on DexScreener</li>
              </ol>
            </div>

            <div className="actions">
              <a
                href={`https://solscan.io/token/${deploymentStatus.mintAddress}?cluster=${deploymentStatus.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View on Solscan
              </a>
              
              <button 
                onClick={() => {
                  setDeploymentStatus(null);
                  setDeploymentId(null);
                  setFormData({
                    tokenName: '',
                    tokenSymbol: '',
                    totalSupply: '1000000000',
                    decimals: '9',
                    description: '',
                  });
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="btn btn-secondary"
              >
                Deploy Another Token
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (deploymentId) {
    return (
      <div className="deploy-token-page">
        <div className="deployment-progress">
          <h1>🚀 Deploying Your Token...</h1>
          
          <div className="progress-steps">
            <div className="step completed">
              <span className="step-icon">✅</span>
              <span>Payment Confirmed</span>
            </div>
            
            <div className={`step ${deploymentStatus?.status === 'pending' ? 'active' : ''}`}>
              <span className="step-icon">⏳</span>
              <span>Creating Token Mint</span>
            </div>
            
            <div className="step">
              <span className="step-icon">💰</span>
              <span>Distributing Supply</span>
            </div>
            
            <div className="step">
              <span className="step-icon">🎉</span>
              <span>Complete</span>
            </div>
          </div>

          <div className="status-info">
            <p>Status: <strong>{deploymentStatus?.status || 'pending'}</strong></p>
            <p>Estimated time: 2-5 minutes</p>
            {paymentSignature && (
              <p className="tx-link">
                <a 
                  href={`https://solscan.io/tx/${paymentSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Payment Transaction
                </a>
              </p>
            )}
          </div>

          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="deploy-token-page">
      <div className="deploy-token-container">
        <h1>🪙 Deploy Your Mineable Token</h1>
        <p className="subtitle">
          Create your own mineable token on Solana in minutes
        </p>

        <div className="instructions-card">
          <h3>📖 How It Works</h3>
          <div className="instructions-grid">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Create Your Token</h4>
                <p>Fill out the form below with your token details. Upload a logo (optional) to make your token stand out on wallets and exchanges.</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Pay Deployment Fee</h4>
                <p>Connect your Solana wallet and pay the deployment fee. Your token will be created on Solana mainnet with metadata uploaded to Arweave.</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Receive Token & Wallets</h4>
                <p>You'll receive your token mint address and 4 specialized wallets (Treasury, Rewards, Liquidity, Marketing) with tokens distributed automatically.</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Enable Mining</h4>
                <p>Use the PepeTor Miner to mine your token! Simply connect your wallet on the Dashboard, start mining, and earn your tokens through proof-of-work.</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Create Liquidity (Optional)</h4>
                <p>Follow the post-deployment guide to create an OpenBook market, add Raydium liquidity, and list on DexScreener for trading.</p>
              </div>
            </div>
          </div>
        </div>

        {pricing && (
          <div className="pricing-card">
            <h3>💰 Deployment Cost</h3>
            <div className="price">
              <span className="amount">{pricing.price} SOL</span>
              <span className="usd">~${(pricing.price * 200).toFixed(2)} USD</span>
            </div>
            <p className="note">{pricing.note}</p>
          </div>
        )}

        <form onSubmit={handleDeploy} className="deploy-form">
          <div className="form-group">
            <label htmlFor="tokenName">Token Name *</label>
            <input
              type="text"
              id="tokenName"
              name="tokenName"
              value={formData.tokenName}
              onChange={handleInputChange}
              placeholder="e.g., My Awesome Token"
              required
              maxLength={32}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tokenSymbol">Token Symbol *</label>
            <input
              type="text"
              id="tokenSymbol"
              name="tokenSymbol"
              value={formData.tokenSymbol}
              onChange={handleInputChange}
              placeholder="e.g., MAT"
              required
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalSupply">Total Supply *</label>
              <input
                type="number"
                id="totalSupply"
                name="totalSupply"
                value={formData.totalSupply}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="decimals">Decimals *</label>
              <input
                type="number"
                id="decimals"
                name="decimals"
                value={formData.decimals}
                onChange={handleInputChange}
                required
                min="0"
                max="9"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your token..."
              rows="4"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo">Logo (optional)</label>
            <p className="input-hint">PNG or JPEG, max 5MB. Recommended: 512x512px</p>
            <input
              type="file"
              id="logo"
              accept="image/png,image/jpeg"
              onChange={handleLogoChange}
              className="file-input"
            />
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Logo preview" />
                <button 
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  className="remove-logo"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          <div className="features-list">
            <h3>✨ What You Get:</h3>
            <ul>
              <li>✅ SPL Token deployed on Solana</li>
              <li>✅ Logo & metadata uploaded to Arweave (if provided)</li>
              <li>✅ 4 specialized wallets (Treasury, Rewards, Liquidity, Marketing)</li>
              <li>✅ Configurable token allocations</li>
              <li>✅ Mint authority revoked (immutable supply)</li>
              <li>✅ Ready for Raydium listing</li>
              <li>✅ Full ownership & control</li>
            </ul>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {!publicKey ? (
            <div className="connect-prompt">
              <p>⚠️ Please connect your wallet to deploy a token</p>
            </div>
          ) : (
            <button 
              type="submit" 
              className="btn btn-primary btn-deploy"
              disabled={deploying || !pricing}
            >
              {deploying ? 'Deploying...' : `Deploy Token (${pricing?.price || '...'} SOL)`}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default DeployTokenPage;
