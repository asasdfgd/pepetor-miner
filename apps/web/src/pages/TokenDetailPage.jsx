import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LiquidityCommitmentWidget from '../components/LiquidityCommitmentWidget';
import './TokenDetailPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TokenDetailPage = () => {
  const { mintAddress } = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTokenDetails();
  }, [mintAddress]);

  const loadTokenDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/token-deployment/token/${mintAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
      } else {
        setError('Token not found');
      }
    } catch (error) {
      console.error('Error loading token:', error);
      setError('Failed to load token details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="token-detail-page">
        <div className="loading">Loading token details...</div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="token-detail-page">
        <div className="error-box">
          <h2>❌ {error || 'Token not found'}</h2>
          <Link to="/" className="btn btn-primary">Go Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="token-detail-page">
      <div className="container">
        <Link to="/" className="back-link">← Back</Link>

        <div className="token-header">
          {token.logoUrl && (
            <img src={token.logoUrl} alt={token.tokenName} className="token-logo" />
          )}
          <div className="token-title">
            <h1>{token.tokenName}</h1>
            <p className="token-symbol">${token.tokenSymbol}</p>
          </div>
        </div>

        <div className="token-info-grid">
          <div className="info-card">
            <div className="info-label">Mint Address</div>
            <div className="info-value monospace">{token.mintAddress}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Total Supply</div>
            <div className="info-value">{token.totalSupply?.toLocaleString() || 'N/A'}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Status</div>
            <div className="info-value">
              <span className={`status-badge ${token.status}`}>
                {token.status}
              </span>
            </div>
          </div>

          {token.useBondingCurve && (
            <div className="info-card">
              <div className="info-label">Launch Type</div>
              <div className="info-value">📈 Bonding Curve</div>
            </div>
          )}

          {token.useBondingCurve && !token.isMigrated && (
            <div className="info-card">
              <div className="info-label">Migration Threshold</div>
              <div className="info-value">{token.bondingCurveMigrationMC} SOL</div>
            </div>
          )}

          {token.isMigrated && (
            <div className="info-card full-width">
              <div className="info-label">🎉 Migrated to DEX</div>
              <div className="info-value">Pool: {token.migratedPoolAddress}</div>
            </div>
          )}
        </div>

        {token.description && (
          <div className="token-description">
            <h3>Description</h3>
            <p>{token.description}</p>
          </div>
        )}

        <div className="token-links">
          {token.website && (
            <a href={token.website} target="_blank" rel="noopener noreferrer" className="link-button">
              🌐 Website
            </a>
          )}
          {token.twitter && (
            <a href={token.twitter} target="_blank" rel="noopener noreferrer" className="link-button">
              𝕏 Twitter
            </a>
          )}
          {token.tradingUrl && (
            <a href={token.tradingUrl} target="_blank" rel="noopener noreferrer" className="link-button">
              📊 Trade on Meteora
            </a>
          )}
        </div>

        {token.useBondingCurve && (
          <LiquidityCommitmentWidget 
            tokenMint={token.mintAddress}
            tokenName={token.tokenName}
            tokenSymbol={token.tokenSymbol}
          />
        )}
      </div>
    </div>
  );
};

export default TokenDetailPage;
