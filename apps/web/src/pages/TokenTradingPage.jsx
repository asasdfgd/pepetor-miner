import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './TokenTradingPage.css';

function TokenTradingPage() {
  const { mintAddress } = useParams();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [tokenInfo, setTokenInfo] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [swapAmount, setSwapAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [recentTrades, setRecentTrades] = useState([]);

  useEffect(() => {
    if (mintAddress) {
      fetchTokenInfo();
      generateMockChartData();
    }
  }, [mintAddress]);

  const fetchTokenInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token-deployment/all`);
      const data = await response.json();
      
      const token = data.deployments?.find(t => t.mintAddress === mintAddress);
      setTokenInfo(token || {
        tokenName: 'Unknown Token',
        tokenSymbol: 'UNK',
        mintAddress: mintAddress,
        description: 'Token information not available'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching token info:', error);
      setLoading(false);
    }
  };

  const generateMockChartData = () => {
    const data = [];
    const basePrice = 0.00001 + Math.random() * 0.0001;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = now - (i * 15 * 60 * 1000);
      const volatility = 0.15;
      const trend = -0.0001 * (100 - i);
      const price = basePrice + trend + (Math.random() - 0.5) * basePrice * volatility;
      
      data.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: Math.max(0.000001, price),
        volume: Math.floor(Math.random() * 100000)
      });
    }
    
    setChartData(data);
    generateRecentTrades(data);
  };

  const generateRecentTrades = (priceData) => {
    const trades = [];
    for (let i = 0; i < 15; i++) {
      const dataPoint = priceData[priceData.length - 1 - i];
      trades.push({
        id: i,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: dataPoint.price,
        amount: Math.floor(Math.random() * 10000),
        time: dataPoint.time
      });
    }
    setRecentTrades(trades);
  };

  const handleSwap = async () => {
    if (!publicKey || !swapAmount) {
      alert('Please connect wallet and enter amount');
      return;
    }

    alert(`${swapDirection === 'buy' ? 'Buying' : 'Selling'} ${swapAmount} ${tokenInfo?.tokenSymbol || 'tokens'}\n\nJupiter integration coming soon!`);
  };

  const formatPrice = (price) => {
    if (price >= 0.01) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toFixed(8);
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const priceChange = chartData.length > 1 
    ? ((currentPrice - chartData[0].price) / chartData[0].price) * 100 
    : 0;

  if (loading) {
    return (
      <div className="container">
        <div className="trading-page">
          <div className="loading">Loading token data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="trading-page">
        <div className="token-header">
          <div className="token-info-header">
            <h1>{tokenInfo?.tokenName || 'Unknown Token'}</h1>
            <span className="token-symbol">{tokenInfo?.tokenSymbol || 'UNK'}</span>
          </div>
          <div className="token-stats">
            <div className="stat">
              <span className="stat-label">Price</span>
              <span className="stat-value">${formatPrice(currentPrice)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">24h Change</span>
              <span className={`stat-value ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">--</span>
            </div>
            <div className="stat">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">--</span>
            </div>
          </div>
        </div>

        <div className="trading-grid">
          <div className="chart-section card">
            <div className="chart-header">
              <h3>📈 Price Chart</h3>
              <div className="chart-timeframe">
                <button className="active">15M</button>
                <button>1H</button>
                <button>4H</button>
                <button>1D</button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e91e63" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickFormatter={(value) => `$${formatPrice(value)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${formatPrice(value)}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#e91e63"
                    strokeWidth={3}
                    fill="url(#priceGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="swap-section card">
            <h3>💱 Swap</h3>
            <div className="swap-controls">
              <div className="swap-direction">
                <button 
                  className={`direction-btn ${swapDirection === 'buy' ? 'active buy' : ''}`}
                  onClick={() => setSwapDirection('buy')}
                >
                  Buy
                </button>
                <button 
                  className={`direction-btn ${swapDirection === 'sell' ? 'active sell' : ''}`}
                  onClick={() => setSwapDirection('sell')}
                >
                  Sell
                </button>
              </div>

              <div className="swap-input-group">
                <label>You {swapDirection === 'buy' ? 'Pay' : 'Sell'}</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="input-token">
                    {swapDirection === 'buy' ? 'SOL' : tokenInfo?.tokenSymbol}
                  </span>
                </div>
              </div>

              <div className="swap-arrow">⬇</div>

              <div className="swap-input-group">
                <label>You {swapDirection === 'buy' ? 'Receive' : 'Get'}</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={swapAmount ? (parseFloat(swapAmount) / currentPrice).toFixed(2) : ''}
                    readOnly
                    placeholder="0.00"
                  />
                  <span className="input-token">
                    {swapDirection === 'buy' ? tokenInfo?.tokenSymbol : 'SOL'}
                  </span>
                </div>
              </div>

              <button className="swap-button" onClick={handleSwap}>
                {publicKey ? 'Swap Now' : 'Connect Wallet'}
              </button>

              <div className="swap-details">
                <div className="detail-row">
                  <span>Rate</span>
                  <span>1 {tokenInfo?.tokenSymbol} = ${formatPrice(currentPrice)}</span>
                </div>
                <div className="detail-row">
                  <span>Fee</span>
                  <span>~0.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="trades-section card">
          <h3>📊 Recent Trades</h3>
          <div className="trades-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(trade => (
                  <tr key={trade.id}>
                    <td>
                      <span className={`trade-type ${trade.type}`}>
                        {trade.type === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                      </span>
                    </td>
                    <td>${formatPrice(trade.price)}</td>
                    <td>{trade.amount.toLocaleString()}</td>
                    <td>{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="token-details card">
          <h3>ℹ️ Token Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Contract Address</span>
              <span className="detail-value mono">{mintAddress}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{tokenInfo?.description || 'No description available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Supply</span>
              <span className="detail-value">{tokenInfo?.totalSupply?.toLocaleString() || '--'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Network</span>
              <span className="detail-value">Solana Mainnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenTradingPage;
