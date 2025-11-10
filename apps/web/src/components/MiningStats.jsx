import { useState, useEffect } from 'react';
import './MiningStats.css';

function MiningStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rewards/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mining-stats loading">Loading stats...</div>;
  }

  if (!stats) {
    return null;
  }

  const getLevelName = (level) => {
    const names = { 1: 'Novice', 2: 'Miner', 3: 'Expert', 4: 'Master' };
    return names[level] || 'Unknown';
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 7) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '⚪';
  };

  const progressToNextLevel = stats.level < 4 
    ? ((stats.xp / stats.nextLevelXP) * 100).toFixed(1)
    : 100;

  return (
    <div className="mining-stats">
      <h2>⛏️ Mining Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card rewards">
          <h3>💰 Rewards</h3>
          <div className="stat-value">{stats.pendingRewards.toFixed(2)}</div>
          <div className="stat-label">Pending PEPETOR</div>
          <div className="stat-details">
            <p>Daily: {stats.dailyEarnings.toFixed(2)} / {stats.maxDailyEarnings}</p>
            <p>Total Earned: {stats.totalEarned.toFixed(2)}</p>
            <p>Claimed: {stats.claimedRewards.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card level">
          <h3>🎖️ Level & XP</h3>
          <div className="stat-value">
            Level {stats.level} {getLevelName(stats.level)}
          </div>
          <div className="stat-label">{stats.xp.toLocaleString()} XP</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          <div className="stat-details">
            <p>Multiplier: {stats.levelMultiplier}x</p>
            {stats.level < 4 && (
              <p>Next level: {stats.nextLevelXP.toLocaleString()} XP</p>
            )}
          </div>
        </div>

        <div className="stat-card streak">
          <h3>{getStreakEmoji(stats.currentStreak)} Streak</h3>
          <div className="stat-value">{stats.currentStreak} Days</div>
          <div className="stat-label">Current Streak</div>
          <div className="stat-details">
            <p>Longest: {stats.longestStreak} days</p>
            <p>Bonus: +{(stats.streakBonus * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="stat-card staking">
          <h3>💎 Staking</h3>
          <div className="stat-value">{stats.stakingBalance.toLocaleString()}</div>
          <div className="stat-label">PEPETOR Staked</div>
          <div className="stat-details">
            <p>Boost: +{(stats.stakingBoost * 100).toFixed(0)}%</p>
            {stats.stakingBalance < 1000 && (
              <p className="info">Stake 1000+ for +20% boost</p>
            )}
            {stats.stakingBalance >= 1000 && stats.stakingBalance < 5000 && (
              <p className="info">Stake 5000+ for +50% boost</p>
            )}
          </div>
        </div>

        <div className="stat-card referrals">
          <h3>👥 Referrals</h3>
          <div className="stat-value">{stats.referrals}</div>
          <div className="stat-label">Total Referrals</div>
          <div className="stat-details">
            <p>Earned: {stats.referralEarnings.toFixed(2)} PEPETOR</p>
            <p>Per referral: 10 PEPETOR</p>
          </div>
        </div>

        <div className="stat-card tasks">
          <h3>✅ Tasks</h3>
          <div className="stat-value">{stats.tasksCompleted.length}</div>
          <div className="stat-label">Completed</div>
          <div className="stat-details">
            {stats.tasksCompleted.length === 0 && (
              <p>Complete tasks to earn bonus PEPETOR!</p>
            )}
            {stats.tasksCompleted.slice(-3).map((task, i) => (
              <p key={i}>✓ {task.taskType}: +{task.reward}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="multipliers-section">
        <h3>🚀 Active Multipliers</h3>
        <div className="multipliers-list">
          <div className="multiplier">
            Level {stats.level}: <strong>{stats.levelMultiplier}x</strong>
          </div>
          {stats.streakBonus > 0 && (
            <div className="multiplier">
              {stats.currentStreak}-day streak: <strong>+{(stats.streakBonus * 100).toFixed(0)}%</strong>
            </div>
          )}
          {stats.stakingBoost > 0 && (
            <div className="multiplier">
              Staking: <strong>+{(stats.stakingBoost * 100).toFixed(0)}%</strong>
            </div>
          )}
          {stats.levelMultiplier === 1 && stats.streakBonus === 0 && stats.stakingBoost === 0 && (
            <p className="info">No active multipliers. Keep mining daily and stake tokens for bonuses!</p>
          )}
        </div>
      </div>

      <div className="recent-sessions">
        <h3>📊 Recent Sessions</h3>
        {stats.recentSessions.length === 0 ? (
          <p>No mining sessions yet. Start mining to earn PEPETOR!</p>
        ) : (
          <div className="sessions-list">
            {stats.recentSessions.map((session, i) => (
              <div key={i} className="session-item">
                <div className="session-info">
                  <span>{Math.floor(session.duration)} min</span>
                  <span>{session.reward.toFixed(4)} PEPETOR</span>
                  {session.luckyBlockHit && (
                    <span className="lucky">🎲 +{session.luckyBlockAmount}</span>
                  )}
                  {session.isTorMode && (
                    <span className="tor">🔒 Tor Mode</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MiningStats;
