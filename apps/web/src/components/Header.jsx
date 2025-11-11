import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import WalletConnect from './WalletConnect';
import TutorialModal from './TutorialModal';
import './Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/');
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img 
              src="https://brown-glamorous-crane-421.mypinata.cloud/ipfs/bafybeicqq3g3o57pdm7wesrlrjw5b77a5n2nzems32qcmodmspfbgbha44" 
              alt="ClearNetLabs Logo" 
              className="logo-img"
            />
            <div className="logo-text-container">
              <span className="logo-text-main">ClearNetLabs</span>
              <span className="logo-text-sub">PepeTor Miner</span>
            </div>
          </Link>

          <nav className="nav-menu">
            {!isAuthenticated && (
              <>
                <Link to="/tokens" className="nav-link">
                  🪙 Tokens
                </Link>
                <Link to="/faq" className="nav-link">
                  FAQ
                </Link>
                <button onClick={handleShowTutorial} className="nav-link tutorial-btn">
                  🎓 Tutorial
                </button>
              </>
            )}
            {isAuthenticated ? (
              <>
                <div className="user-info">
                  <span className="username">{user?.username || 'User'}</span>
                </div>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {user?.username?.toLowerCase() === 'clearnetmoney' && (
                  <Link to="/admin" className="nav-link">
                    🛡️ Admin
                  </Link>
                )}
                <Link to="/tokens" className="nav-link">
                  🪙 Tokens
                </Link>
                <Link to="/deploy-token" className="nav-link">
                  🚀 Deploy Token
                </Link>
                <Link to="/tor" className="nav-link">
                  🧅 Tor
                </Link>
                <button onClick={handleShowTutorial} className="nav-link tutorial-btn">
                  🎓 Tutorial
                </button>
                <WalletConnect />
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary-nav">
                  Register
                </Link>
                <WalletConnect />
              </>
            )}
          </nav>
        </div>
      </div>
      
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </header>
  );
}

export default Header;