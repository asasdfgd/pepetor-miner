import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { getBalance } from '../services/sessionService';
import './BalanceCard.css';

function BalanceCard() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!connected || !publicKey) {
          setError('Please connect your wallet');
          setLoading(false);
          return;
        }

        const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const mintAddress = import.meta.env.VITE_PEPETOR_MINT_ADDRESS;

        if (!mintAddress) {
          setError('Token not configured');
          setLoading(false);
          return;
        }

        const connection = new Connection(rpcUrl, 'confirmed');
        const mintPubkey = new PublicKey(mintAddress);
        
        const tokenAccountAddress = await getAssociatedTokenAddress(
          mintPubkey,
          publicKey
        );

        try {
          const tokenAccount = await getAccount(connection, tokenAccountAddress);
          const tokenBalance = Number(tokenAccount.amount) / Math.pow(10, 9);
          setBalance(tokenBalance);
        } catch (err) {
          if (err.message.includes('could not find')) {
            setBalance(0);
          } else {
            throw err;
          }
        }

        const balanceData = await getBalance();
        if (balanceData) {
          setStats({
            totalSessions: balanceData.totalSessionsSubmitted || 0,
            bytesTransferred: balanceData.totalBytesTransferred || 0,
            totalDuration: balanceData.totalSessionDuration || 0,
          });
        }

      } catch (err) {
        console.error('Error fetching balance:', err);
        const errorMsg = err.message || err.error || (typeof err === 'string' ? err : 'Failed to fetch balance');
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="balance-card">
      <div className="balance-card-header">
        <h3>💰 Your Balance</h3>
        <button 
          className="refresh-btn"
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading balance...</div>
      ) : error ? (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          <div className="balance-display">
            <div className="balance-amount">
              <span className="balance-value">{balance !== null ? balance.toFixed(2) : '0.00'}</span>
              <span className="balance-unit">$PEPETOR</span>
            </div>
          </div>

          {stats && (
            <div className="balance-stats">
              <div className="stat-row">
                <span className="stat-label">Sessions Submitted:</span>
                <span className="stat-value">{stats.totalSessions}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Data Transferred:</span>
                <span className="stat-value">{formatBytes(stats.bytesTransferred)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Duration:</span>
                <span className="stat-value">{formatDuration(stats.totalDuration)}</span>
              </div>
            </div>
          )}

          <div className="client-id">
            <label>Your Wallet Address:</label>
            <code className="client-pub-key">
              {publicKey ? publicKey.toString().substring(0, 16) + '...' + publicKey.toString().substring(publicKey.toString().length - 16) : 'Not connected'}
            </code>
            {publicKey && (
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(publicKey.toString());
                  alert('Wallet address copied to clipboard');
                }}
                title="Copy full wallet address"
              >
                📋 Copy Address
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BalanceCard;