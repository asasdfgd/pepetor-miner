import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TableViewPage.css';

function TableViewPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const limit = 50;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchTokens();
  }, [page, filter]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/token-deployment/all?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data.deployments || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-view-page">
      <div className="container">
        <div className="table-header">
          <h1>All Tokens</h1>
          <div className="table-actions">
            <Link to="/deploy-token" className="btn btn-primary">
              Create Token
            </Link>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            🌟 All Tokens
          </button>
          <button
            className={`filter-tab ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            🌱 New Tokens
          </button>
          <button
            className={`filter-tab ${filter === 'oldest' ? 'active' : ''}`}
            onClick={() => setFilter('oldest')}
          >
            🪐 Oldest Tokens
          </button>
        </div>

        {loading && tokens.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tokens...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>❌ {error}</p>
            <button onClick={fetchTokens} className="btn btn-secondary">
              Retry
            </button>
          </div>
        ) : tokens.length === 0 ? (
          <div className="empty-state">
            <p>🔍 No tokens found</p>
            <p className="empty-subtitle">Be the first to create a token!</p>
            <Link to="/deploy-token" className="btn btn-primary">
              Create Token
            </Link>
          </div>
        ) : (
          <>
            <div className="token-table-wrapper">
              <table className="token-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <th>Symbol</th>
                    <th>Creator</th>
                    <th>Mint Address</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={token._id || index}>
                      <td className="rank-cell">#{(page - 1) * limit + index + 1}</td>
                      <td className="token-cell">
                        <div className="token-info">
                          {token.logoUrl ? (
                            <img
                              src={token.logoUrl}
                              alt={token.tokenName}
                              className="token-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="token-logo-placeholder">
                              {token.tokenSymbol?.[0] || '?'}
                            </div>
                          )}
                          <div className="token-logo-placeholder" style={{ display: 'none' }}>
                            {token.tokenSymbol?.[0] || '?'}
                          </div>
                          <span className="token-name">{token.tokenName}</span>
                        </div>
                      </td>
                      <td className="symbol-cell">{token.tokenSymbol}</td>
                      <td className="creator-cell">
                        <code>{truncateAddress(token.owner)}</code>
                      </td>
                      <td className="mint-cell">
                        {token.mintAddress ? (
                          <a
                            href={`https://solscan.io/token/${token.mintAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mint-link"
                          >
                            {truncateAddress(token.mintAddress)}
                          </a>
                        ) : (
                          <span className="text-muted">Pending</span>
                        )}
                      </td>
                      <td className="age-cell">
                        {formatTimeAgo(token.deployedAt || token.createdAt)}
                      </td>
                      <td className="actions-cell">
                        {token.mintAddress && (
                          <a
                            href={`https://dexscreener.com/solana/${token.mintAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                          >
                            Chart
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages} ({total} tokens)
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TableViewPage;
