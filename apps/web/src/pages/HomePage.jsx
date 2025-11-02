import { useState, useEffect } from 'react';
import api from '../services/api';
import './HomePage.css';

function HomePage() {
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('');
        setApiInfo(response);
      } catch (err) {
        setError(err);
        console.error('Error fetching API info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApiInfo();
  }, []);

  return (
    <div className="container">
      <div className="home-page">
        <section className="hero">
          <h2>Welcome to PEPETOR-MINER</h2>
          <p>A full-stack web application with browser extension support</p>
        </section>

        <section className="features">
          <div className="features-grid">
            <div className="feature-card card">
              <h3>🚀 Fast API</h3>
              <p>Express.js backend with RESTful endpoints</p>
            </div>
            <div className="feature-card card">
              <h3>⚛️ React Frontend</h3>
              <p>Modern React UI with smooth interactions</p>
            </div>
            <div className="feature-card card">
              <h3>🔌 Chrome Extension</h3>
              <p>Browser extension for enhanced functionality</p>
            </div>
          </div>
        </section>

        <section className="api-info card">
          <h3>API Status</h3>
          {loading ? (
            <div className="loading">Loading API information...</div>
          ) : error ? (
            <div className="error">
              <strong>Connection Error:</strong> Unable to reach the backend API
            </div>
          ) : apiInfo ? (
            <div className="info-box">
              <p><strong>Message:</strong> {apiInfo.message}</p>
              <p><strong>Version:</strong> {apiInfo.version}</p>
              {apiInfo.endpoints && (
                <div>
                  <p><strong>Available Endpoints:</strong></p>
                  <ul>
                    {Object.entries(apiInfo.endpoints).map(([name, value]) => {
                      // Handle nested objects (like auth, users, sessions)
                      if (typeof value === 'object' && value !== null) {
                        return (
                          <li key={name}>
                            <strong>{name}:</strong>
                            <ul>
                              {Object.entries(value).map(([subName, subPath]) => (
                                <li key={`${name}-${subName}`}>
                                  <code>{String(subPath)}</code>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      }
                      // Handle string values (like health)
                      return (
                        <li key={name}>
                          <code>{String(value)}</code> - {name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="getting-started card">
          <h3>Getting Started</h3>
          <ol>
            <li>Explore the API using the health check endpoint</li>
            <li>Build features with the available API endpoints</li>
            <li>Connect the Chrome extension for extended functionality</li>
            <li>Deploy to production</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
