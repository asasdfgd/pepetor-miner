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
  const { login, isAuthenticated, updateUser } = useAuth();
  const hasAuthenticatedRef = useRef(false);
  const hasLinkedRef = useRef(false);

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

  const linkWallet = useCallback(async () => {
    if (!publicKey || !isAuthenticated || hasLinkedRef.current) {
      return;
    }

    try {
      hasLinkedRef.current = true;
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/link-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          updateUser(data.data.user);
        }
        console.log('Wallet linked successfully');
      }
    } catch (error) {
      console.error('Failed to link wallet:', error);
      hasLinkedRef.current = false;
    }
  }, [publicKey, isAuthenticated, updateUser]);

  useEffect(() => {
    if (connected && publicKey && !isAuthenticated) {
      handleWalletAuth();
    }
  }, [connected, publicKey, isAuthenticated, handleWalletAuth]);

  useEffect(() => {
    if (connected && publicKey && isAuthenticated) {
      linkWallet();
    }
  }, [connected, publicKey, isAuthenticated, linkWallet]);

  useEffect(() => {
    if (!connected) {
      hasAuthenticatedRef.current = false;
      hasLinkedRef.current = false;
    }
  }, [connected]);

  return (
    <div className="wallet-connect">
      <WalletMultiButton />
    </div>
  );
}

export default WalletConnect;
