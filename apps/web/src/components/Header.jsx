import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import WalletConnect from './WalletConnect';
import './Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/');
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
                <Link to="/extension" className="nav-link">
                  Extension
                </Link>
                <Link to="/faq" className="nav-link">
                  FAQ
                </Link>
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
                <Link to="/deploy-token" className="nav-link">
                  🚀 Deploy Token
                </Link>
                <Link to="/tor" className="nav-link">
                  🧅 Tor
                </Link>
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
    </header>
  );
}

export default Header;