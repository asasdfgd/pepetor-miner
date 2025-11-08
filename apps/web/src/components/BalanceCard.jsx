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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTokens, setAvailableTokens] = useState([{ symbol: 'SOL', name: 'Solana', mintAddress: 'SOL', balance: 0 }]);
  const [selectedToken, setSelectedToken] = useState('SOL');

  useEffect(() => {
    const fetchTokensWithBalances = async () => {
      if (!connected || !publicKey) {
        setAvailableTokens([{ symbol: 'SOL', name: 'Solana', mintAddress: 'SOL', balance: 0 }]);
        setBalance(0);
        return;
      }

      try {
        const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const connection = new Connection(rpcUrl, 'confirmed');

        const solBalance = await connection.getBalance(publicKey);
        const tokensWithBalance = [
          { 
            symbol: 'SOL', 
            name: 'Solana', 
            mintAddress: 'SOL',
            balance: solBalance / LAMPORTS_PER_SOL 
          }
        ];

        setAvailableTokens(tokensWithBalance);
        setBalance(solBalance / LAMPORTS_PER_SOL);

        Promise.race([
          api.get('/token-deployment/all'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]).then(async (response) => {
          const allTokens = response.deployments || [];
          
          const tokenChecks = allTokens.map(async (token) => {
            try {
              const mintPubkey = new PublicKey(token.mintAddress);
              const tokenAccountAddress = await getAssociatedTokenAddress(
                mintPubkey,
                publicKey
              );
              
              const tokenAccount = await getAccount(connection, tokenAccountAddress);
              const tokenBalance = Number(tokenAccount.amount) / Math.pow(10, 9);
              
              if (tokenBalance > 0) {
                return {
                  symbol: token.tokenSymbol,
                  name: token.tokenName,
                  mintAddress: token.mintAddress,
                  balance: tokenBalance
                };
              }
            } catch (err) {
              return null;
            }
            return null;
          });

          const results = await Promise.all(tokenChecks);
          const validTokens = results.filter(t => t !== null);
          
          setAvailableTokens([tokensWithBalance[0], ...validTokens]);
        }).catch(() => {});

      } catch (err) {
        console.error('Error fetching tokens:', err);
      }
    };
    fetchTokensWithBalances();
  }, [connected, publicKey]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!connected || !publicKey) {
        setStats({ totalSessions: 0, bytesTransferred: 0, totalDuration: 0 });
        return;
      }

      const token = availableTokens.find(t => t.symbol === selectedToken);
      if (token) {
        setBalance(token.balance || 0);
      }

      try {
        const balanceData = await Promise.race([
          getBalance(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);
        
        if (balanceData) {
          setStats({
            totalSessions: balanceData.totalSessionsSubmitted || 0,
            bytesTransferred: balanceData.totalBytesTransferred || 0,
            totalDuration: balanceData.totalSessionDuration || 0,
          });
        }
      } catch (err) {
        setStats({ totalSessions: 0, bytesTransferred: 0, totalDuration: 0 });
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

      {!connected || !publicKey ? (
        <div className="error">Please connect your wallet</div>
      ) : (
        <>
          <div className="balance-display">
            <div className="balance-amount">
              <span className="balance-value">{balance !== null ? balance.toFixed(4) : '0.0000'}</span>
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
              {publicKey.toString().substring(0, 16) + '...' + publicKey.toString().substring(publicKey.toString().length - 16)}
            </code>
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
          </div>
        </>
      )}
    </div>
  );
}

export default BalanceCard;