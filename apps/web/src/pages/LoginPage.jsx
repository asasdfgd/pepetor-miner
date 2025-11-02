import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import './AuthPages.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, setAuthError, clearError, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      // Call auth service
      const result = await authService.login(formData.email, formData.password);

      // Update auth context
      login(result.user, result.accessToken, result.refreshToken);

      // Sync token to extension storage
      if (window.chrome?.storage?.sync) {
        chrome.storage.sync.set({ 
          token: result.accessToken,
          apiUrl: 'http://localhost:3001/api'
        });
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setAuthError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Login to PEPETOR-MINER</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;