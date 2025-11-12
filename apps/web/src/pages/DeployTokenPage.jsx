import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  ComputeBudgetProgram
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
    liquidityAmount: '1',
    useBondingCurve: true,
    initialPurchaseAmount: '0',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentId, setDeploymentId] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [paymentSignature, setPaymentSignature] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [formData.useBondingCurve]);

  useEffect(() => {
    if (deploymentId) {
      const interval = setInterval(() => {
        checkDeploymentStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [deploymentId]);

  const fetchPricing = async (liquidityAmount = formData.liquidityAmount, initialPurchaseAmount = formData.initialPurchaseAmount) => {
    try {
      const useBondingCurve = formData.useBondingCurve || false;
      const url = `${import.meta.env.VITE_API_BASE_URL}/token-deployment/price?liquidityAmount=${liquidityAmount || 0}&useBondingCurve=${useBondingCurve}&initialPurchaseAmount=${initialPurchaseAmount || 0}`;
      console.log('🔍 fetchPricing called with:', { liquidityAmount, initialPurchaseAmount, useBondingCurve });
      console.log('🌐 Request URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('📦 API pricing response:', data);
      if (data.success) {
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('handleInputChange:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'liquidityAmount') {
      const numValue = parseFloat(value);
      console.log('liquidityAmount changed:', { value, numValue, isValid: !isNaN(numValue) && numValue >= 0 });
      if (!isNaN(numValue) && numValue >= 0) {
        fetchPricing(value, formData.initialPurchaseAmount);
      } else if (value === '' || value === '0') {
        fetchPricing('0', formData.initialPurchaseAmount);
      }
    }
    
    if (name === 'initialPurchaseAmount') {
      const numValue = parseFloat(value);
      console.log('initialPurchaseAmount changed:', { value, numValue, isValid: !isNaN(numValue) && numValue >= 0 });
      if (!isNaN(numValue) && numValue >= 0) {
        console.log('Calling fetchPricing with liquidityAmount:', formData.liquidityAmount, 'initialPurchaseAmount:', value);
        fetchPricing(formData.liquidityAmount, value);
      } else if (value === '' || value === '0') {
        fetchPricing(formData.liquidityAmount, '0');
      }
    }
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

  const sendPayment = async (retryCount = 0) => {
    if (!publicKey || !pricing) return null;

    const MAX_RETRIES = 3;
    const JITO_BLOCK_ENGINE = 'https://mainnet.block-engine.jito.wtf/api/v1';
    const JITO_TIP_ACCOUNTS = [
      'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
      'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
      '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
      '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
    ];

    try {
      setPaymentStatus(retryCount > 0 ? `Retrying with Jito (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...` : 'Creating Jito bundle...');
      console.log('=== JITO BUNDLE PAYMENT ===');
      console.log('Pricing object:', pricing);
      console.log('totalPrice value:', pricing.totalPrice, 'type:', typeof pricing.totalPrice);
      
      if (!pricing.treasuryWallet || pricing.treasuryWallet === 'Not configured') {
        throw new Error('Treasury wallet not configured. Please contact support.');
      }

      if (typeof pricing.totalPrice !== 'number' || isNaN(pricing.totalPrice) || pricing.totalPrice <= 0) {
        throw new Error(`Invalid pricing: ${pricing.totalPrice}. Please refresh and try again.`);
      }

      const treasuryPubkey = new PublicKey(pricing.treasuryWallet);
      const lamportsToSend = Math.floor(pricing.totalPrice * LAMPORTS_PER_SOL);
      
      const jitoTipAmount = Math.floor(0.0015 * LAMPORTS_PER_SOL * (1 + retryCount * 0.5));
      const jitoTipAccount = new PublicKey(JITO_TIP_ACCOUNTS[retryCount % JITO_TIP_ACCOUNTS.length]);
      
      console.log('Payment amount:', lamportsToSend, '(', lamportsToSend / LAMPORTS_PER_SOL, 'SOL)');
      console.log('Jito tip:', jitoTipAmount, '(', jitoTipAmount / LAMPORTS_PER_SOL, 'SOL)');
      console.log('Jito tip account:', jitoTipAccount.toBase58());
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      console.log('Got blockhash:', blockhash);
      
      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: blockhash,
      })
      .add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 })
      )
      .add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 })
      )
      .add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: lamportsToSend,
        })
      )
      .add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: jitoTipAccount,
          lamports: jitoTipAmount,
        })
      );
      
      setPaymentStatus('Signing transaction...');
      const signedTx = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        preflightCommitment: 'finalized',
      });
      
      console.log('Transaction signed:', signedTx);
      
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      
      const base58Tx = Buffer.from(serializedTx).toString('base64');
      
      setPaymentStatus('Submitting to Jito validators...');
      console.log('Sending bundle to Jito...');
      
      const bundleResponse = await fetch(`${JITO_BLOCK_ENGINE}/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendBundle',
          params: [[base58Tx]]
        }),
      });
      
      const bundleResult = await bundleResponse.json();
      console.log('Bundle response:', bundleResult);
      
      if (bundleResult.error) {
        throw new Error(`Jito error: ${bundleResult.error.message || JSON.stringify(bundleResult.error)}`);
      }
      
      const bundleId = bundleResult.result;
      console.log('Bundle submitted:', bundleId);
      setPaymentStatus('Waiting for Jito confirmation...');
      
      const startTime = Date.now();
      const CONFIRMATION_TIMEOUT = 90000;
      let confirmed = false;
      
      while (Date.now() - startTime < CONFIRMATION_TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const status = await connection.getSignatureStatus(signedTx);
          
          if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
            if (status.value.err) {
              throw new Error('Transaction failed on-chain');
            }
            confirmed = true;
            break;
          }
        } catch (pollError) {
          console.log('Poll attempt failed:', pollError.message);
        }
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setPaymentStatus(`Waiting for Jito confirmation... (${elapsed}s elapsed)`);
      }
      
      if (!confirmed) {
        console.warn('Bundle not confirmed after timeout - backend will verify');
        setPaymentStatus('Transaction submitted - verifying in background...');
      } else {
        console.log('Bundle confirmed!');
        setPaymentStatus('Payment confirmed!');
      }
      
      return signedTx;
    } catch (error) {
      console.error('Jito payment failed:', error);
      
      const isExpirationError = error.message && (
        error.message.includes('block height exceeded') || 
        error.message.includes('blockhash not found') ||
        error.message.includes('Transaction expired') ||
        error.message.includes('Bundle dropped')
      );
      
      if (isExpirationError || retryCount === 0) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying Jito bundle (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return sendPayment(retryCount + 1);
        }
      }
      
      setPaymentStatus(null);
      throw new Error('Payment failed: ' + error.message);
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    setError(null);
    setPaymentStatus(null);
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
      setPaymentStatus('Submitting deployment request...');

      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('tokenName', formData.tokenName);
      formDataToSend.append('tokenSymbol', formData.tokenSymbol);
      formDataToSend.append('totalSupply', formData.totalSupply);
      formDataToSend.append('decimals', formData.decimals);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('paymentSignature', signature);
      formDataToSend.append('paymentMethod', 'SOL');
      formDataToSend.append('useBondingCurve', formData.useBondingCurve.toString());
      
      if (formData.useBondingCurve) {
        const initialPurchase = parseFloat(formData.initialPurchaseAmount) || 0;
        if (initialPurchase > 0) {
          formDataToSend.append('initialPurchaseAmount', initialPurchase.toString());
        }
      }
      
      if (!formData.useBondingCurve) {
        const liquidityAmount = parseFloat(formData.liquidityAmount) || 0;
        if (liquidityAmount > 0) {
          formDataToSend.append('createPool', 'true');
          formDataToSend.append('poolLiquiditySOL', liquidityAmount.toString());
        }
      }
      
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
      setPaymentStatus('Deployment started! Creating your token...');
    } catch (error) {
      console.error('Deployment error:', error);
      setError(error.message);
      setPaymentStatus(null);
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

            {deploymentStatus.useBondingCurve && deploymentStatus.bondingCurvePool && (
              <div className="bonding-curve-success-section">
                <h3>📈 Bonding Curve Pool Live!</h3>
                <div className="success-banner bonding-curve-banner">
                  <p className="fire-emoji">🚀🎉</p>
                  <p className="success-message">Your token is live on a bonding curve!</p>
                  <p className="success-submessage">No upfront liquidity needed • Auto-graduates to DEX at 85 SOL</p>
                </div>
                
                <div className="detail-item">
                  <label>Pool Address:</label>
                  <code>{deploymentStatus.bondingCurvePool}</code>
                  <button onClick={() => copyToClipboard(deploymentStatus.bondingCurvePool, 'Pool address')} className="copy-btn">
                    Copy
                  </button>
                </div>

                {deploymentStatus.tradingUrl && (
                  <div className="trading-links">
                    <a href={deploymentStatus.tradingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      🎯 Start Trading on Meteora
                    </a>
                  </div>
                )}

                <div className="bonding-curve-explainer">
                  <h4>✨ What happens next?</h4>
                  <ul className="checklist">
                    <li>✅ Share trading link with your community</li>
                    <li>💰 You earn 50% of all trading fees</li>
                    <li>📈 Token price increases as SOL is added</li>
                    <li>🎯 At 85 SOL market cap, auto-migrates to Meteora DEX</li>
                    <li>🔒 After migration, liquidity is locked forever</li>
                    <li>📊 Will auto-list on DexScreener after migration</li>
                  </ul>
                </div>
              </div>
            )}

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

            {deploymentStatus.marketId && deploymentStatus.poolAddress ? (
              <div className="next-steps success">
                <h3>🎉 Token Launched on DEX!</h3>
                <div className="success-banner">
                  <p className="fire-emoji">🔥🔥🔥</p>
                  <p className="success-message">LP Tokens Burned - Liquidity Locked Forever!</p>
                  <p className="success-submessage">Just like pump.fun - your liquidity is permanently locked</p>
                </div>
                <ul className="checklist">
                  <li>✅ Token deployed on Solana {deploymentStatus.network}</li>
                  <li>✅ Metadata uploaded to Arweave</li>
                  <li>✅ OpenBook Market created (ID: {deploymentStatus.marketId})</li>
                  <li>✅ Raydium liquidity pool created</li>
                  <li>🔥 LP tokens burned (can't be recovered)</li>
                  <li>✅ Trading live on Raydium</li>
                  <li>✅ Auto-listing on DexScreener (5-10 min)</li>
                </ul>
                <div className="trading-links">
                  <a href={`https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${deploymentStatus.mintAddress}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    🔗 Trade on Raydium
                  </a>
                  <a href={`https://dexscreener.com/solana/${deploymentStatus.mintAddress}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    📊 View on DexScreener
                  </a>
                </div>
              </div>
            ) : (
              <div className="next-steps">
                <h3>📋 Next Steps - Complete Liquidity Setup:</h3>
                <ol>
                  <li>✅ Token deployed on Solana {deploymentStatus.network}</li>
                  <li>✅ Metadata uploaded to Arweave (if logo provided)</li>
                  <li>📊 Import your <strong>Liquidity Wallet</strong> private key to Phantom (see below)</li>
                  <li>💰 Send some SOL to the Liquidity Wallet for fees (~0.5 SOL)</li>
                  <li>🌊 Go to <a href="https://raydium.io/liquidity/create/" target="_blank" rel="noopener noreferrer">Raydium</a> and create a liquidity pool</li>
                  <li>🔒 Lock LP tokens on <a href="https://www.streamflow.finance/" target="_blank" rel="noopener noreferrer">Streamflow</a> for community trust</li>
                  <li>📈 Your token will auto-list on DexScreener once pool is created</li>
                </ol>
                <p className="warning-text">⚠️ You'll need ~0.5 SOL in Liquidity Wallet for OpenBook Market creation (~0.4 SOL) + gas fees</p>
              </div>
            )}

            <div className="import-wallet-guide">
              <h3>💼 How to Use Phantom for Liquidity</h3>
              <div className="guide-section">
                <h4>Step 1: Import Your Liquidity Wallet</h4>
                <ol className="import-steps">
                  <li>Open Phantom Wallet → Click Settings (⚙️) → Add / Connect Wallet</li>
                  <li>Select "Import Private Key"</li>
                  <li>Copy the <strong>Liquidity Wallet Private Key</strong> above and paste it</li>
                  <li>Your tokens will appear in that wallet!</li>
                  <li>Send ~0.5 SOL to this wallet for OpenBook/Raydium fees</li>
                </ol>
              </div>
              
              <div className="guide-section">
                <h4>Step 2: Create Liquidity on Raydium</h4>
                <ol className="import-steps">
                  <li>Make sure you're on the Liquidity Wallet in Phantom</li>
                  <li>Go to <a href="https://raydium.io/liquidity/create/" target="_blank" rel="noopener noreferrer">Raydium Create Pool</a></li>
                  <li>Connect your Phantom wallet</li>
                  <li>Select your token and SOL as the pair</li>
                  <li>Add your desired liquidity amounts</li>
                  <li>Confirm the transaction in Phantom</li>
                </ol>
              </div>
              
              <div className="guide-section">
                <h4>📦 Access All Your Tokens</h4>
                <p className="info-text">Import each wallet below to access different portions of your token supply:</p>
                <ul>
                  <li><strong>Treasury Wallet:</strong> Main reserve (20%)</li>
                  <li><strong>Rewards Wallet:</strong> For airdrops & mining rewards (30%)</li>
                  <li><strong>Liquidity Wallet:</strong> For DEX liquidity (20%)</li>
                  <li><strong>Marketing Wallet:</strong> For marketing expenses (15%)</li>
                </ul>
              </div>
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
                    liquidityAmount: '1',
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
        <h1>🪙 Deploy Your Token</h1>
        <p className="subtitle">
          Create your own token on Solana in minutes
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
                <h4>Enable Mining (Coming Soon)</h4>
                <p>The PepeTor Miner will allow you to mine your token through proof-of-work. This feature is currently under development and will be available soon.</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Create Liquidity (Manual - Post-Deployment)</h4>
                <p>After deployment, you'll receive step-by-step instructions to create an OpenBook market and add Raydium liquidity using your generated wallets. This enables trading on DEXs and auto-listing on DexScreener.</p>
              </div>
            </div>
          </div>
        </div>

        {pricing && (
          <div className="pricing-card">
            <h3>💰 Total Cost</h3>
            <div className="price">
              <span className="amount">{pricing.totalPrice} SOL</span>
              <span className="usd">~${pricing.priceUSD || '0.00'} USD</span>
            </div>
            {pricing.breakdown && (
              <div className="price-breakdown">
                {pricing.breakdown.map((line, i) => (
                  <p key={i} className="breakdown-line">{line}</p>
                ))}
              </div>
            )}
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

          <div className="form-group launch-type-group">
            <label>🚀 Launch Type</label>
            <div className="launch-type-options">
              <button
                type="button"
                className={`launch-type-btn ${!formData.useBondingCurve ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, useBondingCurve: false }))}
              >
                <div className="launch-type-header">
                  <span className="launch-type-icon">⚡</span>
                  <span className="launch-type-name">Instant DEX</span>
                </div>
                <div className="launch-type-details">
                  <p>• Immediate trading on Raydium</p>
                  <p>• Requires upfront liquidity</p>
                  <p>• Cost: ~1.5 SOL total</p>
                </div>
              </button>
              
              <button
                type="button"
                className={`launch-type-btn ${formData.useBondingCurve ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, useBondingCurve: true }))}
              >
                <div className="launch-type-header">
                  <span className="launch-type-icon">📈</span>
                  <span className="launch-type-name">Bonding Curve</span>
                  <span className="badge-new">RECOMMENDED</span>
                </div>
                <div className="launch-type-details">
                  <p>✅ No upfront liquidity needed</p>
                  <p>✅ Auto-graduates to DEX at 85 SOL</p>
                  <p>✅ Cost: Only 0.073 SOL (~$12)</p>
                  <p>✅ Earn fees from every trade</p>
                </div>
              </button>
            </div>
          </div>

          {!formData.useBondingCurve && (
            <div className="form-group liquidity-group">
              <label htmlFor="liquidityAmount">
                🚀 Instant Launch Liquidity (SOL)
              </label>
            <p className="input-hint">
              💡 Add liquidity to auto-create Raydium pool. Set to 0 to deploy without liquidity.
              <br />
              🔥 LP tokens will be burned (liquidity locked forever, like pump.fun)
            </p>
            <input
              type="number"
              id="liquidityAmount"
              name="liquidityAmount"
              value={formData.liquidityAmount}
              onChange={handleInputChange}
              placeholder="1.0"
              min="0.01"
              step="0.01"
            />
            {parseFloat(formData.liquidityAmount) > 0 && pricing && (
              <div className="liquidity-breakdown">
                <p><strong>💰 Cost Breakdown:</strong></p>
                <ul>
                  <li>Deployment: {pricing.deploymentPrice} SOL</li>
                  <li>Liquidity: {pricing.liquidityAmount} SOL</li>
                  <li>OpenBook Market: {pricing.marketCreationCost} SOL</li>
                  <li><strong>Total: {pricing.totalPrice.toFixed(4)} SOL (~${pricing.priceUSD} USD)</strong></li>
                </ul>
                <p className="info-text">✅ Your token will be tradeable instantly on Raydium!</p>
              </div>
            )}
            </div>
          )}

          {formData.useBondingCurve && (
            <>
              <div className="form-group">
                <label htmlFor="initialPurchaseAmount">
                  💰 Buy Your Own Tokens (Optional)
                </label>
                <p className="input-hint">
                  💡 Optional but recommended! Buying coins helps protect from snipers and shows commitment.
                  <br />
                  💸 Set to 0 to skip initial purchase.
                </p>
                <input
                  type="number"
                  id="initialPurchaseAmount"
                  name="initialPurchaseAmount"
                  value={formData.initialPurchaseAmount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <div style={{background: '#333', padding: '10px', marginTop: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#0f0'}}>
                  <div>🔍 DEBUG: Form State</div>
                  <div>initialPurchaseAmount: {formData.initialPurchaseAmount}</div>
                  <div>useBondingCurve: {formData.useBondingCurve ? 'true' : 'false'}</div>
                  {pricing && <div>API returned totalPrice: {pricing.totalPrice}</div>}
                  {pricing && pricing.initialPurchaseAmount !== undefined && <div>API returned initialPurchaseAmount: {pricing.initialPurchaseAmount}</div>}
                </div>
              </div>
              
              {pricing && (
                <div className="bonding-curve-info" style={{border: '2px solid #0f0', padding: '15px', marginTop: '10px'}}>
                  <h4>📈 Bonding Curve Launch</h4>
                  <p className="cost-display" style={{fontSize: '20px', fontWeight: 'bold', color: '#0f0'}}>
                    💰 Total Cost: {pricing.totalPrice.toFixed(4)} SOL (~${pricing.priceUSD} USD)
                  </p>
                  {pricing.breakdown && (
                    <div className="price-breakdown" style={{background: '#222', padding: '10px', marginTop: '10px'}}>
                      {pricing.breakdown.map((line, i) => (
                        <p key={i} className="breakdown-line" style={{margin: '5px 0', fontSize: '14px'}}>{line}</p>
                      ))}
                    </div>
                  )}
                  <ul>
                    <li>✅ No upfront liquidity required</li>
                    <li>✅ Token price increases as more SOL is added</li>
                    <li>✅ Auto-graduates to Meteora DEX at 85 SOL market cap</li>
                    <li>✅ You earn 50% of all trading fees</li>
                    <li>✅ Buyers can sell back to curve before graduation</li>
                    <li>🔥 Liquidity locked forever after graduation</li>
                  </ul>
                </div>
              )}
            </>
          )}

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
              {parseFloat(formData.liquidityAmount) > 0 ? (
                <>
                  <li>✅ OpenBook market created automatically</li>
                  <li>✅ Raydium liquidity pool created</li>
                  <li>🔥 LP tokens burned (liquidity locked forever)</li>
                  <li>✅ Instant trading on DEX</li>
                  <li>✅ Auto-listed on DexScreener</li>
                </>
              ) : (
                <li>✅ Ready for manual liquidity setup</li>
              )}
              <li>✅ Full ownership & control</li>
            </ul>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {paymentStatus && (
            <div className="payment-status-message">
              🔄 {paymentStatus}
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
              {deploying ? (paymentStatus || 'Deploying...') : parseFloat(formData.liquidityAmount) > 0 
                ? `🚀 Launch on DEX (${pricing?.totalPrice?.toFixed(4) || '...'} SOL)` 
                : `Deploy Token (${pricing?.totalPrice?.toFixed(4) || '...'} SOL)`}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default DeployTokenPage;
