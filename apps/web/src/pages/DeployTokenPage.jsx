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
    website: '',
    twitter: '',
    walletAddress: '',
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
      if (!pricing.treasuryWallet || pricing.treasuryWallet === 'Not configured') {
        throw new Error('Treasury wallet not configured. Please contact support.');
      }

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
      
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      
      if (formData.twitter) {
        formDataToSend.append('twitter', formData.twitter);
      }
      
      if (formData.walletAddress) {
        formDataToSend.append('walletAddress', formData.walletAddress);
      }
      
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

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const addTokenToWallet = async () => {
    if (!window.solana || !deploymentStatus?.mintAddress) return;
    
    try {
      await window.solana.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'SPL',
          options: {
            address: deploymentStatus.mintAddress,
            symbol: deploymentStatus.tokenSymbol,
            decimals: deploymentStatus.decimals || 9,
          },
        },
      });
      alert('Token added to Phantom wallet!');
    } catch (error) {
      console.error('Failed to add token:', error);
      alert('Failed to add token to wallet. Please add it manually using the mint address.');
    }
  };

  const downloadWallets = () => {
    if (!deploymentStatus) return;
    
    const walletsData = {
      tokenName: deploymentStatus.tokenName,
      tokenSymbol: deploymentStatus.tokenSymbol,
      mintAddress: deploymentStatus.mintAddress,
      network: deploymentStatus.network,
      wallets: {
        treasury: {
          publicKey: deploymentStatus.treasuryWallet,
          privateKey: deploymentStatus.treasuryKeypair,
        },
        rewards: {
          publicKey: deploymentStatus.rewardsWallet,
          privateKey: deploymentStatus.rewardsKeypair,
        },
        liquidity: {
          publicKey: deploymentStatus.liquidityWallet,
          privateKey: deploymentStatus.liquidityKeypair,
        },
        marketing: {
          publicKey: deploymentStatus.marketingWallet,
          privateKey: deploymentStatus.marketingKeypair,
        },
      },
    };
    
    const blob = new Blob([JSON.stringify(walletsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deploymentStatus.tokenSymbol}-wallets.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                onClick={() => copyToClipboard(deploymentStatus.mintAddress, 'Mint address')}
                className="copy-btn"
              >
                Copy
              </button>
            </div>

            <div className="wallet-keypairs-section">
              <h3>🔑 Your Wallet Keypairs (Access Your Tokens)</h3>
              <p className="warning-text">⚠️ IMPORTANT: Save these private keys! These wallets contain all your token supply.</p>
              <p className="info-text">💡 Import these wallets into Phantom to access and manage your tokens.</p>
              
              <div className="keypair-item">
                <label>Treasury Wallet:</label>
                <div className="keypair-details">
                  <div className="keypair-row">
                    <span className="keypair-label">Public Key:</span>
                    <code>{deploymentStatus.treasuryWallet}</code>
                    <button onClick={() => copyToClipboard(deploymentStatus.treasuryWallet, 'Treasury public key')} className="copy-btn">Copy</button>
                  </div>
                  <div className="keypair-row">
                    <span className="keypair-label">Private Key:</span>
                    <code className="private-key">[{deploymentStatus.treasuryKeypair?.join(',')}]</code>
                    <button onClick={() => copyToClipboard(JSON.stringify(deploymentStatus.treasuryKeypair), 'Treasury private key')} className="copy-btn">Copy</button>
                  </div>
                </div>
              </div>

              <div className="keypair-item">
                <label>Rewards Wallet:</label>
                <div className="keypair-details">
                  <div className="keypair-row">
                    <span className="keypair-label">Public Key:</span>
                    <code>{deploymentStatus.rewardsWallet}</code>
                    <button onClick={() => copyToClipboard(deploymentStatus.rewardsWallet, 'Rewards public key')} className="copy-btn">Copy</button>
                  </div>
                  <div className="keypair-row">
                    <span className="keypair-label">Private Key:</span>
                    <code className="private-key">[{deploymentStatus.rewardsKeypair?.join(',')}]</code>
                    <button onClick={() => copyToClipboard(JSON.stringify(deploymentStatus.rewardsKeypair), 'Rewards private key')} className="copy-btn">Copy</button>
                  </div>
                </div>
              </div>

              <div className="keypair-item">
                <label>Liquidity Wallet:</label>
                <div className="keypair-details">
                  <div className="keypair-row">
                    <span className="keypair-label">Public Key:</span>
                    <code>{deploymentStatus.liquidityWallet}</code>
                    <button onClick={() => copyToClipboard(deploymentStatus.liquidityWallet, 'Liquidity public key')} className="copy-btn">Copy</button>
                  </div>
                  <div className="keypair-row">
                    <span className="keypair-label">Private Key:</span>
                    <code className="private-key">[{deploymentStatus.liquidityKeypair?.join(',')}]</code>
                    <button onClick={() => copyToClipboard(JSON.stringify(deploymentStatus.liquidityKeypair), 'Liquidity private key')} className="copy-btn">Copy</button>
                  </div>
                </div>
              </div>

              <div className="keypair-item">
                <label>Marketing Wallet:</label>
                <div className="keypair-details">
                  <div className="keypair-row">
                    <span className="keypair-label">Public Key:</span>
                    <code>{deploymentStatus.marketingWallet}</code>
                    <button onClick={() => copyToClipboard(deploymentStatus.marketingWallet, 'Marketing public key')} className="copy-btn">Copy</button>
                  </div>
                  <div className="keypair-row">
                    <span className="keypair-label">Private Key:</span>
                    <code className="private-key">[{deploymentStatus.marketingKeypair?.join(',')}]</code>
                    <button onClick={() => copyToClipboard(JSON.stringify(deploymentStatus.marketingKeypair), 'Marketing private key')} className="copy-btn">Copy</button>
                  </div>
                </div>
              </div>
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

            <div className="import-wallet-guide">
              <h3>💼 Import Wallets to Phantom</h3>
              <p className="info-text">To access your tokens in Phantom Wallet, import each wallet's private key:</p>
              <ol className="import-steps">
                <li>Open Phantom Wallet → Click Settings (⚙️) → Add / Connect Wallet</li>
                <li>Select "Import Private Key"</li>
                <li>Copy one of the private keys below and paste it</li>
                <li>Your tokens will appear in that wallet!</li>
              </ol>
              <p className="warning-text">💡 Tip: Import all wallets to have full control of your token supply</p>
            </div>

            <div className="actions">
              <button 
                onClick={addTokenToWallet}
                className="btn btn-primary"
              >
                🔔 Add Token to Phantom
              </button>

              <button 
                onClick={downloadWallets}
                className="btn btn-primary"
              >
                💾 Download All Wallets
              </button>
              
              <a
                href={`https://solscan.io/token/${deploymentStatus.mintAddress}?cluster=${deploymentStatus.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
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
                    website: '',
                    twitter: '',
                    walletAddress: '',
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
              <span className="usd">~${pricing.priceUSD || '10.00'} USD</span>
            </div>
            <p className="note">{pricing.note}</p>
            <p className="sol-price-info">Current SOL Price: ${pricing.solPrice?.toFixed(2) || '...'}</p>
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
            <label htmlFor="website">Website (optional)</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourproject.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitter">X (Twitter) Account (optional)</label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="@yourproject or https://x.com/yourproject"
            />
          </div>

          <div className="form-group">
            <label htmlFor="walletAddress">Phantom Wallet Address (optional)</label>
            <p className="input-hint">Your Solana wallet address for receiving tokens</p>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              placeholder={publicKey ? publicKey.toString() : "Connect wallet or enter manually"}
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
