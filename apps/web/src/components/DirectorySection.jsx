import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
import './DirectorySection.css';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';

function DirectorySection() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [users, setUsers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket');
    });

    newSocket.on('user:update', (update) => {
      console.log('📡 User update:', update);
      fetchData();
    });

    newSocket.on('token:update', (update) => {
      console.log('📡 Token update:', update);
      fetchData();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      if (activeTab === 'users') {
        socket.emit('subscribe:users');
      } else {
        socket.emit('subscribe:tokens');
      }
    }
  }, [activeTab, socket]);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await api.get(`/users?page=${page}&limit=20`);
        console.log('Users response:', response);
        setUsers(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.totalPages || 1);
      } else {
        const response = await api.get(`/token-deployment/all?page=${page}&limit=20`);
        console.log('Tokens response:', response);
        setTokens(Array.isArray(response.deployments) ? response.deployments : []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      console.error('Directory fetch error:', err);
      if (activeTab === 'users') {
        setUsers([]);
      } else {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWallet = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatEmail = (email) => {
    if (!email) return 'N/A';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const visibleChars = Math.max(1, Math.ceil(username.length * 0.3));
    const maskedPart = '*'.repeat(Math.max(3, username.length - visibleChars));
    return `${username.slice(0, visibleChars)}${maskedPart}@${domain}`;
  };

  return (
    <div className="directory-section">
      <div className="directory-header">
        <h3>📁 Directory</h3>
        <div className="directory-tabs">
          <button
            className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            🪙 Tokens
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </div>
      </div>

      <div className="directory-content">
        {loading ? (
          <div className="directory-loading">Loading...</div>
        ) : activeTab === 'tokens' ? (
          <div className="directory-list">
            {tokens.length === 0 ? (
              <div className="directory-empty">No tokens deployed yet</div>
            ) : (
              <div className="tokens-grid">
                {tokens.map((token) => (
                  <div key={token.id} className="token-card">
                    <div className="token-header">
                      <h4>{token.tokenName}</h4>
                      <span className="token-symbol">{token.tokenSymbol}</span>
                    </div>
                    <div className="token-details">
                      <div className="detail-row">
                        <span className="detail-label">Owner:</span>
                        <span className="detail-value">{formatWallet(token.owner)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Mint:</span>
                        <span className="detail-value mono">{formatWallet(token.mintAddress)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Deployed:</span>
                        <span className="detail-value">{formatDate(token.deployedAt)}</span>
                      </div>
                    </div>
                    {token.description && (
                      <p className="token-description">{token.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="directory-list">
            {users.length === 0 ? (
              <div className="directory-empty">No users found</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Wallet</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="user-username">{user.username}</td>
                        <td className="user-email">{formatEmail(user.email)}</td>
                        <td className="mono">{formatWallet(user.walletAddress)}</td>
                        <td>
                          <span className={`badge badge-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectorySection;
