import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import * as cpuWebMiner from '@marco_ciaramella/cpu-web-miner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MiningPage = () => {
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [cpuThrottle, setCpuThrottle] = useState(50);
  const [hashRateHistory, setHashRateHistory] = useState([]);
  const miner = useRef(null);
  const { user } = useAuth();
  console.log('MiningPage: Component rendered.');

  useEffect(() => {
    console.log('MiningPage: User effect triggered.', user);
    if (!user) {
      console.log('MiningPage: User is not available yet.');
      return;
    }
    console.log('MiningPage: User is available.');

    const fetchStats = async () => {
      console.log('MiningPage: Attempting to fetch stats...');
      try {
        const response = await api.get('/mining/stats');
        // Gracefully handle cases where the API returns no stats for a new user
        if (response && response.data) {
          setTotalHashes(response.data.totalHashes || 0);
          setEstimatedEarnings(response.data.rewardsEarned || 0);
          console.log('MiningPage: Successfully fetched stats.', response.data);
        } else {
          console.log('MiningPage: No initial stats found for user, using defaults.');
          setTotalHashes(0);
          setEstimatedEarnings(0);
        }
      } catch (error) {
        console.error('MiningPage: Failed to fetch mining stats.', error);
        // Set default stats on failure to prevent crash
        setTotalHashes(0);
        setEstimatedEarnings(0);
      }
    };

    fetchStats();

    const initMiner = async () => {
      console.log('MiningPage: Attempting to initialize miner...');
      if (user && user.walletAddress) {
        console.log('MiningPage: Conditions met for miner initialization. Wallet:', user.walletAddress);
        const stratum = {
          server: "gulf.moneroocean.stream",
          port: 10128,
          worker: user.walletAddress,
          password: "x",
          ssl: false
        };

        try {
          miner.current = await cpuWebMiner.start(
            cpuWebMiner.ghostrider, // Assuming ghostrider is the desired algorithm, this might need to be adjusted
            stratum,
            null,
            cpuWebMiner.ALL_THREADS,
            (work) => console.log(work),
            (hashrate) => {
              setHashRate(hashrate);
              setHashRateHistory(oldHistory => [...oldHistory, { time: new Date().toLocaleTimeString(), hashRate: hashrate }].slice(-20));
            },
            (error) => console.error(error)
          );
          console.log('MiningPage: Miner initialized successfully.');
        } catch (error) {
          console.error('MiningPage: Miner initialization failed!', error);
        }
      } else {
        console.log('MiningPage: Conditions for miner initialization not met.', { hasUser: !!user, hasWallet: !!user?.walletAddress });
      }
    };
    initMiner();
  }, [user?.walletAddress]);

  const handleStartMining = async () => {
    if (miner.current) {
      miner.current.start();
      setIsMining(true);
    }
  };

  const handleStopMining = async () => {
    if (miner.current) {
      miner.current.stop();
      setIsMining(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const response = await api.post('/mining/withdraw');
      alert(response.data.message);
      // Refresh stats after withdrawal
      const statsResponse = await api.get('/mining/stats');
      if (statsResponse && statsResponse.data) {
        setTotalHashes(statsResponse.data.totalHashes || 0);
        setEstimatedEarnings(statsResponse.data.rewardsEarned || 0);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to withdraw rewards';
      alert(errorMessage);
    }
  };

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
              <button onClick={handleStartMining} disabled={!miner.current} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
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
            <LineChart data={hashRateHistory}>
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