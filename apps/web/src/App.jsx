import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import WalletProvider from './contexts/WalletProvider';
import { useExtensionBridge } from './hooks/useExtensionBridge';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TorPage from './pages/TorPage';
import ExtensionPage from './pages/ExtensionPage';
import FaqPage from './pages/FaqPage';
import DeployTokenPage from './pages/DeployTokenPage';
import TableViewPage from './pages/TableViewPage';
import TokenTradingPage from './pages/TokenTradingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import './App.css';

/**
 * App wrapper with extension bridge
 */
function AppContent() {
  // Initialize extension bridge to enable communication
  useExtensionBridge();

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/extension" element={<ExtensionPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/tokens" element={<TableViewPage />} />
          <Route path="/trade/:mintAddress" element={<TokenTradingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deploy-token"
            element={
              <ProtectedRoute>
                <DeployTokenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tor"
            element={
              <ProtectedRoute>
                <TorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <p>Powered by PepeTor Miner</p>
              <p className="footer-tagline">Privacy-First Token Creation & Mining</p>
            </div>
            
            <div className="footer-links">
              <a href="/terms" className="footer-link">Terms of Service</a>
              <span className="footer-separator">•</span>
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <span className="footer-separator">•</span>
              <a href="https://github.com/asasdfgd/pepetor-miner" target="_blank" rel="noopener noreferrer" className="footer-link">
                Open Source
              </a>
            </div>
            
            <div className="footer-disclaimer">
              <p>⚠️ Disclaimer: ClearNetLabs is a decentralized token creation platform. Users are solely responsible for tokens they create. Not financial advice. DYOR.</p>
              <p className="footer-risk">Cryptocurrency investments carry risk. Only invest what you can afford to lose.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <WalletProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;
