import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
          <p>&copy; 2024 ClearNetLabs. All rights reserved. | Powered by PepeTor Miner</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
