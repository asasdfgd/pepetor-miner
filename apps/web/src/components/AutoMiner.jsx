import { useState, useEffect, useRef } from 'react';
import { submitSession } from '../services/sessionService';
import { useAuth } from '../hooks/useAuth';
import './AutoMiner.css';

const SESSION_DURATION_MS = 30 * 60 * 1000;
const AUTO_STOP_DURATION_MS = 2 * 60 * 60 * 1000;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function AutoMiner({ onSessionSubmitted }) {
  const { isAuthenticated } = useAuth();
  const [mining, setMining] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [currentSessionBytes, setCurrentSessionBytes] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [loadingTokens, setLoadingTokens] = useState(true);
  
  const miningIntervalRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);

  const generateSessionId = () => {
    return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const simulateBytes = () => {
    return Math.floor(Math.random() * 50000) + 100000;
  };

  const startMining = () => {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    setMining(true);
    setElapsedSeconds(0);
    setCurrentSessionBytes(0);
    setLastError(null);
    sessionIdRef.current = generateSessionId();

    tickIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      setCurrentSessionBytes(prev => prev + Math.floor(Math.random() * 5000) + 1000);
    }, 1000);

    miningIntervalRef.current = setTimeout(async () => {
      await submitCurrentSession();
    }, SESSION_DURATION_MS);

    autoStopTimeoutRef.current = setTimeout(() => {
      stopMining();
    }, AUTO_STOP_DURATION_MS);
  };

  const submitCurrentSession = async () => {
    if (!sessionStartTime || !sessionIdRef.current) return;

    try {
      const endTime = Date.now();
      const duration = Math.floor((endTime - sessionStartTime) / 1000);
      const bytesTransferred = currentSessionBytes || simulateBytes();

      const sessionData = {
        sessionId: sessionIdRef.current,
        timestamp: new Date(sessionStartTime).toISOString(),
        duration,
        bytesTransferred,
        ipHash: `auto_${Math.random().toString(36).substr(2, 12)}`,
      };

      const response = await submitSession(sessionData);
      
      if (response.success) {
        const pepetorEarned = response.session?.pepetorEarned || response.session?.creditsGranted || 0;
        setSessionCount(prev => prev + 1);
        setTotalCreditsEarned(prev => prev + pepetorEarned);
        setLastError(null);
        
        if (onSessionSubmitted) {
          onSessionSubmitted(response);
        }
      }

      startMining();
    } catch (error) {
      console.error('Error submitting auto session:', error);
      setLastError(error.message || 'Failed to submit session');
      startMining();
    }
  };

  const stopMining = () => {
    if (miningIntervalRef.current) {
      clearTimeout(miningIntervalRef.current);
      miningIntervalRef.current = null;
    }
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    setMining(false);
    setElapsedSeconds(0);
    setSessionStartTime(null);
    sessionIdRef.current = null;
  };

  const toggleMining = () => {
    if (mining) {
      stopMining();
    } else {
      startMining();
    }
  };

  useEffect(() => {
    fetchAvailableTokens();
    
    if (isAuthenticated && !mining) {
      startMining();
    }
    
    return () => {
      stopMining();
    };
  }, [isAuthenticated]);

  const fetchAvailableTokens = async () => {
    try {
      setLoadingTokens(true);
      const response = await fetch(`${API_BASE_URL}/api/token-deployment/all?limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      const tokens = data.deployments || [];
      
      const pepetorToken = {
        _id: 'pepetor',
        tokenName: 'PEPETOR',
        tokenSymbol: 'PEPETOR',
        mintAddress: 'native',
        logoUrl: null,
        isPrimary: true,
      };
      
      setAvailableTokens([pepetorToken, ...tokens]);
      setSelectedToken(pepetorToken);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      const pepetorToken = {
        _id: 'pepetor',
        tokenName: 'PEPETOR',
        tokenSymbol: 'PEPETOR',
        mintAddress: 'native',
        logoUrl: null,
        isPrimary: true,
      };
      setAvailableTokens([pepetorToken]);
      setSelectedToken(pepetorToken);
    } finally {
      setLoadingTokens(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const progressPercent = (elapsedSeconds / 1800) * 100;
  const timeRemaining = 1800 - elapsedSeconds;

  return (
    <div className="auto-miner-card">
      <div className="auto-miner-header">
        <h3>⛏️ Auto Miner</h3>
        <div className={`status-badge ${mining ? 'active' : 'inactive'}`}>
          {mining ? '● MINING' : '○ IDLE'}
        </div>
      </div>

      <div className="token-selector-section">
        <label className="token-selector-label">Mining Token</label>
        <div className="token-selector-wrapper">
          <select
            className="token-selector"
            value={selectedToken?._id || ''}
            onChange={(e) => {
              const token = availableTokens.find(t => t._id === e.target.value);
              setSelectedToken(token);
            }}
            disabled={mining || loadingTokens}
          >
            {loadingTokens ? (
              <option>Loading tokens...</option>
            ) : (
              availableTokens.map((token) => (
                <option key={token._id} value={token._id}>
                  {token.tokenSymbol} - {token.tokenName}
                  {token.isPrimary ? ' (Primary)' : ''}
                </option>
              ))
            )}
          </select>
          {selectedToken?.logoUrl && (
            <img 
              src={selectedToken.logoUrl} 
              alt={selectedToken.tokenSymbol}
              className="token-selector-logo"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>
      </div>

      <div className="miner-stats">
        <div className="stat-box">
          <span className="stat-label">Sessions Completed</span>
          <span className="stat-value">{sessionCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total ${selectedToken?.tokenSymbol || 'PEPETOR'}</span>
          <span className="stat-value credits">{totalCreditsEarned.toFixed(2)}</span>
        </div>
      </div>

      {mining && (
        <div className="current-session">
          <div className="session-info">
            <div className="info-row">
              <span>Time Elapsed:</span>
              <strong>{formatTime(elapsedSeconds)}</strong>
            </div>
            <div className="info-row">
              <span>Time Remaining:</span>
              <strong>{formatTime(Math.max(0, timeRemaining))}</strong>
            </div>
            <div className="info-row">
              <span>Data Generated:</span>
              <strong>{formatBytes(currentSessionBytes)}</strong>
            </div>
          </div>

          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="progress-text">
            {progressPercent.toFixed(1)}% Complete
          </div>
        </div>
      )}

      {lastError && (
        <div className="miner-error">
          ⚠️ {lastError}
        </div>
      )}

      <div className="miner-controls">
        <button
          className={`miner-btn ${mining ? 'stop' : 'start'}`}
          onClick={toggleMining}
        >
          {mining ? '⏸️ Stop Mining' : '▶️ Start Mining'}
        </button>
      </div>

      <div className="miner-info">
        <p>💡 <strong>How it works:</strong></p>
        <ul>
          <li>Mining starts automatically when you log in</li>
          <li>Sessions are submitted every 30 minutes</li>
          <li>Auto-stops after 2 hours (restart manually to continue)</li>
          <li>Keep this tab open to earn ${selectedToken?.tokenSymbol || 'tokens'} passively</li>
          <li>${selectedToken?.tokenSymbol || 'Tokens'} sent directly to your wallet</li>
        </ul>
      </div>
    </div>
  );
}

export default AutoMiner;
