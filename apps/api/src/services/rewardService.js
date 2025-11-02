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
      basePerMinute: 0.001, // 0.001 PEPETOR per minute of mining
      uptime: {
        multiplier1h: 1.1,
        multiplier8h: 1.25,
        multiplier24h: 1.5,
      },
      referral: 10, // 10 PEPETOR per referral
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
   * Calculate reward for mining session
   * @param {number} durationMinutes - How long user mined
   * @param {number} uptimePercentage - Uptime % (0-100)
   * @returns {number} Reward amount in PEPETOR
   */
  calculateSessionReward(durationMinutes, uptimePercentage = 100) {
    let reward = this.rates.basePerMinute * durationMinutes;

    // Apply uptime multiplier
    if (uptimePercentage === 100 && durationMinutes >= 1440) { // 24+ hours
      reward *= this.rates.uptime.multiplier24h;
    } else if (uptimePercentage === 100 && durationMinutes >= 480) { // 8+ hours
      reward *= this.rates.uptime.multiplier8h;
    } else if (uptimePercentage === 100 && durationMinutes >= 60) { // 1+ hour
      reward *= this.rates.uptime.multiplier1h;
    }

    return Math.round(reward * 1e8) / 1e8; // 8 decimals
  }

  /**
   * Record mining session and accrue rewards
   * @param {string} userId - User ID
   * @param {object} sessionData - { durationMinutes, bytesTransferred, peerId }
   */
  async recordMiningSession(userId, sessionData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Calculate reward
      const sessionReward = this.calculateSessionReward(
        sessionData.durationMinutes,
        sessionData.uptimePercentage || 100
      );

      // Initialize pending rewards if needed
      if (!user.pendingRewards) {
        user.pendingRewards = 0;
      }

      // Add to pending (will be claimed by user)
      user.pendingRewards += sessionReward;

      // Track mining sessions
      if (!user.miningSessions) {
        user.miningSessions = [];
      }

      user.miningSessions.push({
        startTime: sessionData.startTime || new Date(),
        duration: sessionData.durationMinutes,
        reward: sessionReward,
        bytesTransferred: sessionData.bytesTransferred || 0,
        peerId: sessionData.peerId,
      });

      // Keep only last 30 sessions for history
      if (user.miningSessions.length > 30) {
        user.miningSessions.shift();
      }

      // Update total earned
      if (!user.totalPepetorEarned) {
        user.totalPepetorEarned = 0;
      }
      user.totalPepetorEarned += sessionReward;

      await user.save();

      logger.info(`Recorded mining session for ${userId}: ${sessionReward} PEPETOR earned`);
      return {
        sessionReward,
        totalPending: user.pendingRewards,
        totalEarned: user.totalPepetorEarned,
      };
    } catch (error) {
      logger.error('Error recording mining session:', error);
      throw error;
    }
  }

  /**
   * Add referral bonus
   * @param {string} referrerId - User who referred
   * @param {string} newUserId - New user referred
   */
  async addReferralBonus(referrerId, newUserId) {
    try {
      const referrer = await User.findById(referrerId);
      if (!referrer) throw new Error('Referrer not found');

      const referrerBonus = this.rates.referral; // 10 PEPETOR

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

      await referrer.save();

      logger.info(`Added referral bonus to ${referrerId}: ${referrerBonus} PEPETOR`);
      return referrerBonus;
    } catch (error) {
      logger.error('Error adding referral bonus:', error);
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
        recentSessions: (user.miningSessions || []).slice(-5).reverse(),
        referrals: user.referrals || 0,
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