import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import './AuthPages.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { login, setAuthError, clearError, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearError();
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      throw new Error('Username, email, and password are required');
    }

    if (formData.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please provide a valid email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      // Validate form
      validateForm();

      // Call auth service
      const result = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

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
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(errorMessage);
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                required
              />
            </div>

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
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe (optional)"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;