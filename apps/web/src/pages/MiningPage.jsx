import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MiningPage = () => {
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [hashRateHistory, setHashRateHistory] = useState([]);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/mining/stats');
      setIsMining(data.isMining || false);
      setHashRate(data.hashRate || 0);
      setTotalHashes(data.totalHashes || 0);
      setEstimatedEarnings(data.rewardsEarned || 0);
      setHashRateHistory(Array.isArray(data.history) ? data.history : []);
    } catch (error) {
      console.error('Failed to fetch mining stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll for stats every 5 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleStartMining = async () => {
    try {
      await api.post('/mining/start');
      setIsMining(true);
    } catch (err) {
      console.error('Start mining failed:', err);
    }
  };

  const handleStopMining = async () => {
    try {
      await api.post('/mining/stop');
      setIsMining(false);
    } catch (err) {
      console.error('Stop mining failed:', err);
    }
  };

  const handleWithdraw = async () => {
    try {
      const response = await api.post('/mining/withdraw');
      alert(response.data.message);
      fetchStats(); // Refresh stats after withdrawal
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to withdraw rewards';
      alert(errorMessage);
    }
  };

  const chartData = Array.isArray(hashRateHistory) ? hashRateHistory : [];

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <img 
        src="https://www.getmonero.org/press-kit/symbols/monero-symbol-on-white-480.png" 
        alt="Monero Logo" 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1,
          width: '500px',
          height: '500px',
          pointerEvents: 'none'
        }}
      />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">Monero Miner</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Status</h2>
            <p className={`text-2xl ${isMining ? 'text-green-500' : 'text-red-500'}`}>
              {isMining ? 'Active' : 'Stopped'}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Hash Rate</h2>
            <p className="text-2xl">{hashRate} H/s</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Total Hashes</h2>
            <p className="text-2xl">{totalHashes}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Est. Earnings (XMR)</h2>
            <p className="text-2xl">{estimatedEarnings.toFixed(8)}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Controls</h2>
          <div className="flex items-center space-x-4">
            {!isMining ? (
              <button onClick={handleStartMining} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Start Mining
              </button>
            ) : (
              <button onClick={handleStopMining} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Stop Mining
              </button>
            )}
            <button onClick={handleWithdraw} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Withdraw Rewards
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Hash Rate Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hashRate" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MiningPage;