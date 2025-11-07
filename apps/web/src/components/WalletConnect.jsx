import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAuth } from '../services/authService';
import './WalletConnect.css';

function WalletConnect() {
  const { publicKey, connected, disconnect } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && publicKey) {
      handleWalletAuth();
    }
  }, [connected, publicKey]);

  const handleWalletAuth = async () => {
    try {
      const walletAddress = publicKey.toString();
      
      const response = await walletAuth(walletAddress);
      
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Wallet auth failed:', error);
      disconnect();
    }
  };

  return (
    <div className="wallet-connect">
      <WalletMultiButton />
    </div>
  );
}

export default WalletConnect;
