import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import './LiquidityCommitmentWidget.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LiquidityCommitmentWidget = ({ tokenMint, tokenName, tokenSymbol }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [stats, setStats] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [userCommitments, setUserCommitments] = useState([]);
  const [amountSOL, setAmountSOL] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimatedAPY, setEstimatedAPY] = useState(null);
  const [estimatedLPTokens, setEstimatedLPTokens] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [balanceError, setBalanceError] = useState(null);

  useEffect(() => {
    if (tokenMint) {
      loadStats();
      loadCommitments();
    }
  }, [tokenMint]);

  useEffect(() => {
    if (publicKey && tokenMint) {
      loadUserCommitments();
    }
  }, [publicKey, tokenMint]);

  useEffect(() => {
    if (amountSOL && stats) {
      calculateEstimates();
    }
  }, [amountSOL, stats]);

  useEffect(() => {
    const checkBalance = async () => {
      if (!publicKey || !connection) return;
      
      try {
        const balance = await connection.getBalance(publicKey);
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        setWalletBalance(balanceSOL);
        
        const amount = parseFloat(amountSOL);
        const requiredAmount = amount + 0.01;
        
        if (balanceSOL < requiredAmount) {
          setBalanceError(`Insufficient balance. You have ${balanceSOL.toFixed(4)} SOL but need ${requiredAmount.toFixed(4)} SOL (includes ~0.01 SOL for fees)`);
        } else {
          setBalanceError(null);
        }
      } catch (err) {
        console.error('Failed to check balance:', err);
        setWalletBalance(null);
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection, amountSOL]);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity-commitment/stats/${tokenMint}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCommitments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity-commitment/token/${tokenMint}`);
      const data = await response.json();
      if (data.success) {
        setCommitments(data.commitments);
      }
    } catch (error) {
      console.error('Error loading commitments:', error);
    }
  };

  const loadUserCommitments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity-commitment/user/${publicKey.toString()}`);
      const data = await response.json();
      if (data.success) {
        const userTokenCommitments = data.commitments.filter(c => c.tokenMint === tokenMint);
        setUserCommitments(userTokenCommitments);
      }
    } catch (error) {
      console.error('Error loading user commitments:', error);
    }
  };

  const calculateEstimates = () => {
    if (!stats) return;
    
    const amount = parseFloat(amountSOL);
    const totalCommitted = stats.totalCommitted + amount;
    
    const lpShare = amount / totalCommitted;
    const estimatedLP = lpShare * 1000000;
    setEstimatedLPTokens(estimatedLP);
    
    if (totalCommitted === 0) {
      setEstimatedAPY(150);
    } else if (totalCommitted < 10) {
      setEstimatedAPY(120);
    } else if (totalCommitted < 30) {
      setEstimatedAPY(80);
    } else if (totalCommitted < 50) {
      setEstimatedAPY(50);
    } else {
      setEstimatedAPY(30);
    }
  };

  const handleCommit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    const amount = parseFloat(amountSOL);
    if (amount < 0.01) {
      setError('Minimum commitment is 0.01 SOL');
      return;
    }

    if (walletBalance !== null && walletBalance < (amount + 0.01)) {
      setError(`Insufficient balance. You have ${walletBalance.toFixed(4)} SOL but need ${(amount + 0.01).toFixed(4)} SOL (includes fees)`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity-commitment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          tokenMint,
          amountSOL: amount,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create commitment');
      }

      const transactionBuffer = Buffer.from(data.commitment.transaction, 'base64');
      const transaction = Transaction.from(transactionBuffer);

      const signature = await sendTransaction(transaction, connection);
      
      await connection.confirmTransaction(signature, 'confirmed');

      await fetch(`${API_BASE_URL}/api/liquidity-commitment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commitmentId: data.commitment.id,
          signature,
        }),
      });

      setSuccess(`✅ Successfully committed ${amount} SOL! Signature: ${signature.slice(0, 8)}...`);
      setAmountSOL('0.1');
      
      loadStats();
      loadCommitments();
      loadUserCommitments();
    } catch (error) {
      console.error('Error committing liquidity:', error);
      setError(error.message || 'Failed to commit liquidity');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCommitment = async (commitmentId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity-commitment/cancel/${commitmentId}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel commitment');
      }

      setSuccess('✅ Commitment cancelled and SOL refunded');
      loadStats();
      loadCommitments();
      loadUserCommitments();
    } catch (error) {
      console.error('Error cancelling commitment:', error);
      setError(error.message || 'Failed to cancel commitment');
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return <div className="liquidity-widget">Loading...</div>;
  }

  if (stats.isMigrated) {
    return (
      <div className="liquidity-widget migrated">
        <h3>🎉 Pool Migrated to DEX</h3>
        <p>This token has graduated to Meteora DEX!</p>
        <p>Liquidity commitments have been fulfilled and LP tokens distributed.</p>
      </div>
    );
  }

  const progressPercent = Math.min((stats.totalCommitted / stats.migrationThreshold) * 100, 100);

  return (
    <div className="liquidity-widget">
      <div className="widget-header">
        <h3>💰 Early Liquidity Commitment</h3>
        <p className="widget-subtitle">Commit SOL now, earn LP tokens when pool graduates</p>
      </div>

      <div className="migration-progress">
        <div className="progress-header">
          <span>Progress to Migration</span>
          <span className="progress-value">{stats.totalCommitted.toFixed(2)} / {stats.migrationThreshold} SOL</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="progress-text">{progressPercent.toFixed(1)}% to DEX graduation</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Committed</div>
          <div className="stat-value">{stats.totalCommitted.toFixed(2)} SOL</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Commitments</div>
          <div className="stat-value">{stats.commitmentCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Est. APY</div>
          <div className="stat-value">{stats.estimatedAPY}%</div>
        </div>
      </div>

      {!stats.isMigrated && (
        <form onSubmit={handleCommit} className="commit-form">
          <div className="form-group">
            <label htmlFor="amountSOL">Commitment Amount (SOL)</label>
            <input
              type="number"
              id="amountSOL"
              value={amountSOL}
              onChange={(e) => setAmountSOL(e.target.value)}
              min="0.01"
              step="0.01"
              disabled={loading}
              required
            />
          </div>

          {estimatedLPTokens && estimatedAPY && (
            <div className="estimate-box">
              <h4>💡 Your Potential Earnings</h4>
              <ul>
                <li>Est. LP Tokens: {estimatedLPTokens.toFixed(0)}</li>
                <li>Est. APY: {estimatedAPY}%</li>
                <li>Your Share: {((parseFloat(amountSOL) / (stats.totalCommitted + parseFloat(amountSOL))) * 100).toFixed(2)}%</li>
              </ul>
              <p className="estimate-note">
                ✅ LP tokens automatically distributed when pool migrates to DEX
              </p>
            </div>
          )}

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">{success}</div>}

          {walletBalance !== null && publicKey && (
            <div className="balance-info" style={{ 
              padding: '10px', 
              backgroundColor: balanceError ? '#fff3cd' : '#d4edda', 
              color: balanceError ? '#856404' : '#155724',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: `1px solid ${balanceError ? '#ffeeba' : '#c3e6cb'}`,
              fontSize: '0.9em'
            }}>
              <strong>💰 Your Balance:</strong> {walletBalance.toFixed(4)} SOL
              <br />
              <strong>📋 Required:</strong> {(parseFloat(amountSOL) + 0.01).toFixed(4)} SOL (includes fees)
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !publicKey || balanceError !== null}
          >
            {loading ? 'Processing...' : balanceError 
              ? '❌ Insufficient Balance' 
              : publicKey 
                ? `Commit ${amountSOL} SOL` 
                : 'Connect Wallet'}
          </button>
        </form>
      )}

      {userCommitments.length > 0 && (
        <div className="user-commitments">
          <h4>Your Commitments</h4>
          <div className="commitments-list">
            {userCommitments.map((commitment) => (
              <div key={commitment._id} className="commitment-card">
                <div className="commitment-info">
                  <span className="commitment-amount">{commitment.amountSOL} SOL</span>
                  <span className="commitment-status">{commitment.status}</span>
                </div>
                {commitment.status === 'pending' && (
                  <button
                    onClick={() => handleCancelCommitment(commitment._id)}
                    className="btn btn-sm btn-cancel"
                    disabled={loading}
                  >
                    Cancel & Refund
                  </button>
                )}
                {commitment.status === 'fulfilled' && (
                  <div className="commitment-fulfilled">
                    ✅ LP Tokens: {commitment.lpTokensReceived?.toFixed(0) || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="how-it-works">
        <h4>ℹ️ How It Works</h4>
        <ol>
          <li>Commit SOL now - it goes into secure escrow</li>
          <li>When pool reaches {stats.migrationThreshold} SOL, it auto-migrates to Meteora DEX</li>
          <li>Your committed SOL is added as liquidity</li>
          <li>You receive LP tokens proportional to your commitment</li>
          <li>Earn trading fees from the DEX pool</li>
        </ol>
      </div>
    </div>
  );
};

export default LiquidityCommitmentWidget;
