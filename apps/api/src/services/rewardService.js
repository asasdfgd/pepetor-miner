/**
 * Reward Service
 * Manages PEPETOR token reward tracking and distribution
 */

const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createTransferInstruction, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const User = require('../models/User');
const logger = require('../utils/logger');

class RewardService {
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
    this.pepetorMint = new PublicKey(process.env.SOLANA_PEPETOR_MINT);
    this.rewardWallet = new PublicKey(process.env.SOLANA_REWARD_WALLET);
    this.backendKeyPair = this.initBackendKeyPair();
    
    // Reward rates (in PEPETOR)
    this.rates = {
      basePerMinute: 0.0015, // 0.0015 PEPETOR per minute of mining
      maxDailyEarnings: 100, // Maximum 100 PEPETOR per day
      inactivityTimeoutMinutes: 5, // Stop if inactive for 5+ minutes
      
      uptime: {
        multiplier1h: 1.1,   // 1 hour = 1.1x
        multiplier8h: 1.25,  // 8 hours = 1.25x
        multiplier24h: 1.5,  // 24 hours = 1.5x
      },
      
      streak: {
        day3: 0.10,   // 3-day streak = +10%
        day7: 0.25,   // 7-day streak = +25%
        day30: 0.50,  // 30-day streak = +50%
      },
      
      referral: {
        primary: 10,     // 10 PEPETOR for direct referral
        referee: 5,      // 5 PEPETOR for the person who joins
        subReferral: 2,  // 2 PEPETOR from sub-referrals
      },
      
      tasks: {
        tokenCreation: 100,  // +100 PEPETOR for creating token
        socialShare: 20,     // +20 PEPETOR for social share
        torModeBonus: 0.15,  // +15% boost for Tor mode
      },
      
      luckyBlock: {
        chancePerHour: 0.05,  // 5% chance per hour
        minReward: 10,
        maxReward: 50,
      },
      
      levels: {
        1: 1.0,  // Level 1 = 1.0x
        2: 1.2,  // Level 2 = 1.2x
        3: 1.5,  // Level 3 = 1.5x
        4: 2.0,  // Level 4 = 2.0x
      },
      
      levelXp: {
        1: 0,      // Level 1 starts at 0 XP
        2: 1000,   // Level 2 at 1000 XP
        3: 5000,   // Level 3 at 5000 XP
        4: 15000,  // Level 4 at 15000 XP
      },
      
      staking: {
        tier1: { amount: 1000, boost: 0.20 },  // 1000+ PEPETOR = +20%
        tier2: { amount: 5000, boost: 0.50 },  // 5000+ PEPETOR = +50%
      },
    };
  }

  /**
   * Initialize backend keypair from private key
   */
  initBackendKeyPair() {
    try {
      const secret = JSON.parse(process.env.SOLANA_BACKEND_KEY);
      return Keypair.fromSecretKey(new Uint8Array(secret));
    } catch (error) {
      logger.error('Failed to initialize backend keypair:', error);
      throw new Error('Invalid SOLANA_BACKEND_KEY in environment');
    }
  }

  /**
   * Calculate level multiplier based on XP
   */
  calculateLevel(xp) {
    if (xp >= this.rates.levelXp[4]) return 4;
    if (xp >= this.rates.levelXp[3]) return 3;
    if (xp >= this.rates.levelXp[2]) return 2;
    return 1;
  }

  /**
   * Calculate staking boost
   */
  calculateStakingBoost(stakingBalance) {
    if (stakingBalance >= this.rates.staking.tier2.amount) {
      return this.rates.staking.tier2.boost;
    }
    if (stakingBalance >= this.rates.staking.tier1.amount) {
      return this.rates.staking.tier1.boost;
    }
    return 0;
  }

  /**
   * Calculate streak bonus
   */
  calculateStreakBonus(streak) {
    if (streak >= 30) return this.rates.streak.day30;
    if (streak >= 7) return this.rates.streak.day7;
    if (streak >= 3) return this.rates.streak.day3;
    return 0;
  }

  /**
   * Check and trigger lucky block
   * @param {number} durationMinutes - Session duration
   * @returns {object} { hit: boolean, amount: number }
   */
  checkLuckyBlock(durationMinutes) {
    const hours = durationMinutes / 60;
    const rolls = Math.floor(hours);
    
    for (let i = 0; i < rolls; i++) {
      if (Math.random() < this.rates.luckyBlock.chancePerHour) {
        const amount = Math.floor(
          Math.random() * (this.rates.luckyBlock.maxReward - this.rates.luckyBlock.minReward + 1)
        ) + this.rates.luckyBlock.minReward;
        return { hit: true, amount };
      }
    }
    return { hit: false, amount: 0 };
  }

  /**
   * Calculate reward for mining session with ALL multipliers
   * @param {number} durationMinutes - How long user mined
   * @param {object} user - User object with level, streak, staking, etc.
   * @param {object} sessionData - Session metadata (isTorMode, etc.)
   * @returns {object} Detailed reward breakdown
   */
  calculateSessionReward(durationMinutes, user, sessionData = {}) {
    const breakdown = {
      base: 0,
      uptimeMultiplier: 1,
      streakBonus: 0,
      levelMultiplier: 1,
      stakingBoost: 0,
      torBonus: 0,
      luckyBlock: 0,
      total: 0,
    };

    // Base reward
    breakdown.base = this.rates.basePerMinute * durationMinutes;

    // Uptime multiplier
    if (durationMinutes >= 1440) {
      breakdown.uptimeMultiplier = this.rates.uptime.multiplier24h;
    } else if (durationMinutes >= 480) {
      breakdown.uptimeMultiplier = this.rates.uptime.multiplier8h;
    } else if (durationMinutes >= 60) {
      breakdown.uptimeMultiplier = this.rates.uptime.multiplier1h;
    }

    // Apply uptime multiplier
    let reward = breakdown.base * breakdown.uptimeMultiplier;

    // Streak bonus
    breakdown.streakBonus = this.calculateStreakBonus(user.currentStreak || 0);
    reward += reward * breakdown.streakBonus;

    // Level multiplier
    const level = this.calculateLevel(user.xp || 0);
    breakdown.levelMultiplier = this.rates.levels[level];
    reward *= breakdown.levelMultiplier;

    // Staking boost
    breakdown.stakingBoost = this.calculateStakingBoost(user.stakingBalance || 0);
    reward += reward * breakdown.stakingBoost;

    // Tor mode bonus
    if (sessionData.isTorMode) {
      breakdown.torBonus = this.rates.tasks.torModeBonus;
      reward += reward * breakdown.torBonus;
    }

    // Lucky block
    const luckyBlock = this.checkLuckyBlock(durationMinutes);
    if (luckyBlock.hit) {
      breakdown.luckyBlock = luckyBlock.amount;
      reward += luckyBlock.amount;
    }

    breakdown.total = Math.round(reward * 1e8) / 1e8; // 8 decimals

    return breakdown;
  }

  /**
   * Update streak based on last mining date
   */
  updateStreak(user) {
    const now = new Date();
    const lastDate = user.lastMiningDate;

    if (!lastDate) {
      // First time mining
      user.currentStreak = 1;
      user.longestStreak = 1;
    } else {
      const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, keep streak
      } else if (daysDiff === 1) {
        // Consecutive day
        user.currentStreak = (user.currentStreak || 0) + 1;
        if (user.currentStreak > (user.longestStreak || 0)) {
          user.longestStreak = user.currentStreak;
        }
      } else {
        // Missed a day, reset streak
        user.currentStreak = 1;
      }
    }

    user.lastMiningDate = now;
  }

  /**
   * Reset daily earnings if new day
   */
  resetDailyEarningsIfNeeded(user) {
    const now = new Date();
    const lastReset = user.dailyEarningsResetDate;

    if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
      user.dailyEarnings = 0;
      user.dailyEarningsResetDate = now;
    }
  }

  /**
   * Add XP and update level
   */
  addXP(user, minutes) {
    const xpGained = Math.floor(minutes * 2); // 2 XP per minute
    user.xp = (user.xp || 0) + xpGained;
    user.level = this.calculateLevel(user.xp);
    return xpGained;
  }

  /**
   * Check inactivity timeout
   */
  checkInactivity(sessionData) {
    if (!sessionData.lastActivityTime) return false;
    
    const inactiveMinutes = (Date.now() - sessionData.lastActivityTime) / (1000 * 60);
    return inactiveMinutes > this.rates.inactivityTimeoutMinutes;
  }

  /**
   * Record mining session and accrue rewards with ALL features
   * @param {string} userId - User ID
   * @param {object} sessionData - { durationMinutes, bytesTransferred, peerId, isTorMode, lastActivityTime }
   */
  async recordMiningSession(userId, sessionData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check inactivity timeout
      if (this.checkInactivity(sessionData)) {
        throw new Error('Session rejected: Inactive for more than 5 minutes');
      }

      // Reset daily earnings if new day
      this.resetDailyEarningsIfNeeded(user);

      // Check daily cap
      if (user.dailyEarnings >= this.rates.maxDailyEarnings) {
        throw new Error('Daily cap reached: Maximum 100 PEPETOR per day');
      }

      // Update streak
      this.updateStreak(user);

      // Calculate reward with ALL multipliers
      const rewardBreakdown = this.calculateSessionReward(
        sessionData.durationMinutes,
        user,
        sessionData
      );

      let finalReward = rewardBreakdown.total;

      // Apply daily cap
      if (user.dailyEarnings + finalReward > this.rates.maxDailyEarnings) {
        finalReward = this.rates.maxDailyEarnings - user.dailyEarnings;
      }

      // Update user earnings
      user.pendingRewards = (user.pendingRewards || 0) + finalReward;
      user.dailyEarnings += finalReward;
      user.totalPepetorEarned = (user.totalPepetorEarned || 0) + finalReward;
      user.lastActivityTime = new Date();

      // Add XP
      const xpGained = this.addXP(user, sessionData.durationMinutes);

      // Track mining session
      if (!user.miningSessions) {
        user.miningSessions = [];
      }

      user.miningSessions.push({
        startTime: sessionData.startTime || new Date(),
        duration: sessionData.durationMinutes,
        reward: finalReward,
        bytesTransferred: sessionData.bytesTransferred || 0,
        peerId: sessionData.peerId,
        isTorMode: sessionData.isTorMode || false,
        luckyBlockHit: rewardBreakdown.luckyBlock > 0,
        luckyBlockAmount: rewardBreakdown.luckyBlock,
      });

      // Keep only last 30 sessions
      if (user.miningSessions.length > 30) {
        user.miningSessions.shift();
      }

      await user.save();

      logger.info(`Recorded mining session for ${userId}: ${finalReward} PEPETOR earned`);
      
      return {
        sessionReward: finalReward,
        breakdown: rewardBreakdown,
        xpGained,
        level: user.level,
        currentStreak: user.currentStreak,
        dailyEarnings: user.dailyEarnings,
        totalPending: user.pendingRewards,
        totalEarned: user.totalPepetorEarned,
        luckyBlock: rewardBreakdown.luckyBlock > 0 ? {
          hit: true,
          amount: rewardBreakdown.luckyBlock,
        } : null,
      };
    } catch (error) {
      logger.error('Error recording mining session:', error);
      throw error;
    }
  }

  /**
   * Add referral bonus (NEW: includes referee bonus and sub-referrals)
   * @param {string} referrerId - User who referred
   * @param {string} newUserId - New user referred
   */
  async addReferralBonus(referrerId, newUserId) {
    try {
      const referrer = await User.findById(referrerId);
      const newUser = await User.findById(newUserId);
      
      if (!referrer) throw new Error('Referrer not found');
      if (!newUser) throw new Error('New user not found');

      // Primary referral: 10 PEPETOR to referrer
      const referrerBonus = this.rates.referral.primary;
      referrer.pendingRewards = (referrer.pendingRewards || 0) + referrerBonus;
      referrer.referrals = (referrer.referrals || 0) + 1;

      if (!referrer.referralBonuses) {
        referrer.referralBonuses = [];
      }

      referrer.referralBonuses.push({
        referredUserId: newUserId,
        bonus: referrerBonus,
        date: new Date(),
      });

      // Referee bonus: 5 PEPETOR to new user
      const refereeBonus = this.rates.referral.referee;
      newUser.pendingRewards = (newUser.pendingRewards || 0) + refereeBonus;
      newUser.referredBy = referrerId;

      // Sub-referral: If referrer was also referred, give 2 PEPETOR to their referrer
      let subReferralBonus = 0;
      if (referrer.referredBy) {
        const grandReferrer = await User.findById(referrer.referredBy);
        if (grandReferrer) {
          subReferralBonus = this.rates.referral.subReferral;
          grandReferrer.pendingRewards = (grandReferrer.pendingRewards || 0) + subReferralBonus;
          
          if (!grandReferrer.referralBonuses) {
            grandReferrer.referralBonuses = [];
          }
          
          grandReferrer.referralBonuses.push({
            referredUserId: newUserId,
            bonus: subReferralBonus,
            date: new Date(),
            type: 'sub-referral',
          });
          
          await grandReferrer.save();
          logger.info(`Added sub-referral bonus to ${grandReferrer._id}: ${subReferralBonus} PEPETOR`);
        }
      }

      await referrer.save();
      await newUser.save();

      logger.info(`Referral bonuses: Referrer ${referrerId}: ${referrerBonus}, Referee ${newUserId}: ${refereeBonus}`);
      
      return {
        referrerBonus,
        refereeBonus,
        subReferralBonus,
      };
    } catch (error) {
      logger.error('Error adding referral bonus:', error);
      throw error;
    }
  }

  /**
   * Award task-based rewards
   * @param {string} userId - User ID
   * @param {string} taskType - 'tokenCreation', 'socialShare', etc.
   */
  async awardTaskReward(userId, taskType) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check if task already completed
      if (!user.tasksCompleted) {
        user.tasksCompleted = [];
      }

      const alreadyCompleted = user.tasksCompleted.some(
        task => task.taskType === taskType
      );

      if (alreadyCompleted && taskType !== 'socialShare') {
        throw new Error('Task already completed');
      }

      let reward = 0;
      switch (taskType) {
        case 'tokenCreation':
          reward = this.rates.tasks.tokenCreation; // 100 PEPETOR
          break;
        case 'socialShare':
          reward = this.rates.tasks.socialShare; // 20 PEPETOR
          break;
        default:
          throw new Error('Unknown task type');
      }

      // Award reward
      user.pendingRewards = (user.pendingRewards || 0) + reward;
      user.totalPepetorEarned = (user.totalPepetorEarned || 0) + reward;

      // Record task completion
      user.tasksCompleted.push({
        taskType,
        reward,
        completedAt: new Date(),
      });

      await user.save();

      logger.info(`Task reward awarded to ${userId}: ${reward} PEPETOR for ${taskType}`);
      
      return {
        taskType,
        reward,
        totalPending: user.pendingRewards,
      };
    } catch (error) {
      logger.error('Error awarding task reward:', error);
      throw error;
    }
  }

  /**
   * Update staking balance
   */
  async updateStakingBalance(userId, amount) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.stakingBalance = amount;
      await user.save();

      logger.info(`Updated staking balance for ${userId}: ${amount} PEPETOR`);
      return { stakingBalance: user.stakingBalance };
    } catch (error) {
      logger.error('Error updating staking balance:', error);
      throw error;
    }
  }

  /**
   * Get user reward status
   * @param {string} userId - User ID
   */
  async getRewardStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      return {
        pendingRewards: user.pendingRewards || 0,
        totalEarned: user.totalPepetorEarned || 0,
        claimedRewards: user.claimedRewards || 0,
        dailyEarnings: user.dailyEarnings || 0,
        maxDailyEarnings: this.rates.maxDailyEarnings,
        
        // Level & XP
        level: user.level || 1,
        xp: user.xp || 0,
        nextLevelXP: this.rates.levelXp[Math.min((user.level || 1) + 1, 4)],
        levelMultiplier: this.rates.levels[user.level || 1],
        
        // Streak
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        streakBonus: this.calculateStreakBonus(user.currentStreak || 0),
        
        // Staking
        stakingBalance: user.stakingBalance || 0,
        stakingBoost: this.calculateStakingBoost(user.stakingBalance || 0),
        
        // Sessions
        recentSessions: (user.miningSessions || []).slice(-5).reverse(),
        
        // Referrals
        referrals: user.referrals || 0,
        referralEarnings: (user.referralBonuses || []).reduce((sum, b) => sum + b.bonus, 0),
        
        // Tasks
        tasksCompleted: user.tasksCompleted || [],
        
        // Wallet
        walletAddress: user.solanaWallet || null,
      };
    } catch (error) {
      logger.error('Error getting reward status:', error);
      throw error;
    }
  }

  /**
   * Claim pending rewards - Transfer PEPETOR to user's wallet
   * @param {string} userId - User ID
   * @param {string} recipientWallet - User's Solana wallet address
   */
  async claimRewards(userId, recipientWallet) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const pendingAmount = user.pendingRewards || 0;
      if (pendingAmount === 0) {
        throw new Error('No pending rewards to claim');
      }

      if (pendingAmount < 1) {
        throw new Error('Minimum claim amount is 1 PEPETOR');
      }

      // Validate wallet address
      try {
        new PublicKey(recipientWallet);
      } catch {
        throw new Error('Invalid Solana wallet address');
      }

      // Check rate limiting (once per day)
      const lastClaim = user.lastRewardClaim || new Date(0);
      const hoursSinceLastClaim = (Date.now() - lastClaim) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24 && user.lastRewardClaim) {
        throw new Error(`Can only claim once per 24 hours. Next claim in ${Math.ceil(24 - hoursSinceLastClaim)} hours`);
      }

      // Create token transfer transaction
      logger.info(`Processing claim for ${userId}: ${pendingAmount} PEPETOR to ${recipientWallet}`);

      const recipientPublicKey = new PublicKey(recipientWallet);

      // Get or create recipient's token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.backendKeyPair,
        this.pepetorMint,
        recipientPublicKey
      );

      // Get backend's token account
      const backendTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.backendKeyPair,
        this.pepetorMint,
        this.backendKeyPair.publicKey
      );

      // Create transfer instruction (accounting for 8 decimals)
      const transferAmount = Math.floor(pendingAmount * 1e8);

      const transferIx = createTransferInstruction(
        backendTokenAccount.address,
        recipientTokenAccount.address,
        this.backendKeyPair.publicKey,
        transferAmount
      );

      // Create and send transaction
      const transaction = new Transaction().add(transferIx);

      const signature = await this.connection.sendTransaction(transaction, [this.backendKeyPair], {
        preflightCommitment: 'confirmed',
      });

      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      logger.info(`Reward transfer confirmed: ${signature}`);

      // Update user
      user.pendingRewards = 0;
      user.claimedRewards = (user.claimedRewards || 0) + pendingAmount;
      user.lastRewardClaim = new Date();
      user.lastClaimTx = signature;
      user.solanaWallet = recipientWallet;

      if (!user.claimHistory) {
        user.claimHistory = [];
      }

      user.claimHistory.push({
        amount: pendingAmount,
        wallet: recipientWallet,
        txHash: signature,
        date: new Date(),
      });

      // Keep only last 10 claims
      if (user.claimHistory.length > 10) {
        user.claimHistory.shift();
      }

      await user.save();

      return {
        success: true,
        amount: pendingAmount,
        txHash: signature,
        recipientWallet,
        message: `Successfully claimed ${pendingAmount} PEPETOR! Transaction: ${signature}`,
      };
    } catch (error) {
      logger.error('Error claiming rewards:', error);
      throw error;
    }
  }

  /**
   * Get rewards leaderboard (top miners)
   * @param {number} limit - Number of top miners to return
   */
  async getLeaderboard(limit = 10) {
    try {
      const topMiners = await User.find({
        totalPepetorEarned: { $gt: 0 },
      })
        .sort({ totalPepetorEarned: -1 })
        .limit(limit)
        .select('username totalPepetorEarned miningSessions referrals');

      return topMiners.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        totalEarned: user.totalPepetorEarned,
        sessions: (user.miningSessions || []).length,
        referrals: user.referrals || 0,
      }));
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      const totalUsers = await User.countDocuments();
      const activeMiners = await User.countDocuments({
        miningSessions: { $exists: true, $ne: [] },
      });

      const stats = await User.aggregate([
        {
          $match: { totalPepetorEarned: { $gt: 0 } },
        },
        {
          $group: {
            _id: null,
            totalDistributed: { $sum: '$totalPepetorEarned' },
            avgPerUser: { $avg: '$totalPepetorEarned' },
            maxPerUser: { $max: '$totalPepetorEarned' },
            minPerUser: { $min: '$totalPepetorEarned' },
          },
        },
      ]);

      const data = stats[0] || {};

      return {
        totalUsers,
        activeMiners,
        totalDistributed: data.totalDistributed || 0,
        avgPerUser: data.avgPerUser || 0,
        maxPerUser: data.maxPerUser || 0,
        minPerUser: data.minPerUser || 0,
        rewardsRemaining: process.env.SOLANA_REWARD_POOL_REMAINING || 'N/A',
      };
    } catch (error) {
      logger.error('Error getting network stats:', error);
      throw error;
    }
  }

  /**
   * Batch update rewards (called periodically for active miners)
   * @param {array} activeSessions - Array of { userId, durationMinutes, ... }
   */
  async batchUpdateRewards(activeSessions) {
    try {
      const results = [];
      for (const session of activeSessions) {
        try {
          const result = await this.recordMiningSession(session.userId, session);
          results.push({ userId: session.userId, success: true, reward: result.sessionReward });
        } catch (error) {
          logger.error(`Failed to update rewards for ${session.userId}:`, error);
          results.push({ userId: session.userId, success: false, error: error.message });
        }
      }
      return results;
    } catch (error) {
      logger.error('Error batch updating rewards:', error);
      throw error;
    }
  }
}

// Export singleton
module.exports = new RewardService();