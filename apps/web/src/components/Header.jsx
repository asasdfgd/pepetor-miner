import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
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
            🔥 PEPETOR-MINER
          </Link>

          <nav className="nav-menu">
            {isAuthenticated ? (
              <>
                <div className="user-info">
                  <span className="username">{user?.username || 'User'}</span>
                </div>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/tor" className="nav-link">
                  🧅 Tor
                </Link>
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
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;