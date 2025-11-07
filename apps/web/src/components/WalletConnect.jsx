import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { walletAuth } from '../services/authService';
import './WalletConnect.css';

function WalletConnect() {
  const { publicKey, connected, disconnect } = useWallet();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const hasAuthenticatedRef = useRef(false);

  const handleWalletAuth = useCallback(async () => {
    if (!publicKey || !connected || hasAuthenticatedRef.current || isAuthenticated) {
      return;
    }

    try {
      hasAuthenticatedRef.current = true;
      const walletAddress = publicKey.toString();
      
      const response = await walletAuth(walletAddress);
      
      if (response.accessToken) {
        login(response.user, response.accessToken, response.refreshToken);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Wallet auth failed:', error);
      hasAuthenticatedRef.current = false;
      disconnect();
    }
  }, [publicKey, connected, isAuthenticated, login, navigate, disconnect]);

  useEffect(() => {
    if (connected && publicKey && !isAuthenticated) {
      handleWalletAuth();
    }
  }, [connected, publicKey, isAuthenticated, handleWalletAuth]);

  useEffect(() => {
    if (!connected) {
      hasAuthenticatedRef.current = false;
    }
  }, [connected]);

  return (
    <div className="wallet-connect">
      <WalletMultiButton />
    </div>
  );
}

export default WalletConnect;
