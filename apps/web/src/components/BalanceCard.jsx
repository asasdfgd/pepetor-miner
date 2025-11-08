import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { getBalance } from '../services/sessionService';
import api from '../services/api';
import './BalanceCard.css';

function BalanceCard() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('SOL');

  useEffect(() => {
    const fetchTokensWithBalances = async () => {
      if (!connected || !publicKey) {
        setAvailableTokens([{ symbol: 'SOL', name: 'Solana', mintAddress: 'SOL', balance: 0 }]);
        return;
      }

      try {
        const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const connection = new Connection(rpcUrl, 'confirmed');

        const response = await api.get('/token-deployment/all');
        const allTokens = response.deployments || [];
        
        const solBalance = await connection.getBalance(publicKey);
        const tokensWithBalance = [
          { 
            symbol: 'SOL', 
            name: 'Solana', 
            mintAddress: 'SOL',
            balance: solBalance / LAMPORTS_PER_SOL 
          }
        ];

        for (const token of allTokens) {
          try {
            const mintPubkey = new PublicKey(token.mintAddress);
            const tokenAccountAddress = await getAssociatedTokenAddress(
              mintPubkey,
              publicKey
            );
            
            const tokenAccount = await getAccount(connection, tokenAccountAddress);
            const tokenBalance = Number(tokenAccount.amount) / Math.pow(10, 9);
            
            if (tokenBalance > 0) {
              tokensWithBalance.push({
                symbol: token.tokenSymbol,
                name: token.tokenName,
                mintAddress: token.mintAddress,
                balance: tokenBalance
              });
            }
          } catch (err) {
            if (!err.message.includes('could not find')) {
              console.error(`Error checking balance for ${token.tokenSymbol}:`, err);
            }
          }
        }

        setAvailableTokens(tokensWithBalance);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setAvailableTokens([{ symbol: 'SOL', name: 'Solana', mintAddress: 'SOL', balance: 0 }]);
      }
    };
    fetchTokensWithBalances();
  }, [connected, publicKey]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!connected || !publicKey) {
          setError('Please connect your wallet');
          setLoading(false);
          return;
        }

        const token = availableTokens.find(t => t.symbol === selectedToken);
        if (token) {
          setBalance(token.balance || 0);
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
        console.error('Error fetching stats:', err);
        const errorMsg = err.message || err.error || (typeof err === 'string' ? err : 'Failed to fetch stats');
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connected, selectedToken, availableTokens]);

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

      <div className="token-selector">
        <label>Your Tokens:</label>
        <select 
          value={selectedToken} 
          onChange={(e) => setSelectedToken(e.target.value)}
          className="token-dropdown"
        >
          {availableTokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol} - {token.name} ({token.balance?.toFixed(4) || '0.0000'})
            </option>
          ))}
        </select>
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
              <span className="balance-value">{balance !== null ? balance.toFixed(4) : '0.00'}</span>
              <span className="balance-unit">${selectedToken}</span>
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