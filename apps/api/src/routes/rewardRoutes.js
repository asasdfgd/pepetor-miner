/**
 * Reward Routes
 * API endpoints for reward management and PEPETOR token distribution
 */

const express = require('express');
const router = express.Router();
const rewardService = require('../services/rewardService');
const authMiddleware = require('../middleware/auth'); // Assuming auth middleware exists
const logger = require('../utils/logger');

// ========================
// MIDDLEWARE
// ========================

/**
 * Require authenticated user
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ========================
// ROUTES
// ========================

/**
 * GET /api/rewards/status
 * Get user's reward status (pending, earned, claimed)
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = await rewardService.getRewardStatus(req.user.id);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Error getting reward status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/rewards/session
 * Record a mining session and accrue rewards
 * Body: { durationMinutes, bytesTransferred, uptimePercentage?, peerId? }
 */
router.post('/session', requireAuth, async (req, res) => {
  try {
    const { durationMinutes, bytesTransferred, uptimePercentage, peerId } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid durationMinutes',
      });
    }

    const result = await rewardService.recordMiningSession(req.user.id, {
      durationMinutes,
      bytesTransferred: bytesTransferred || 0,
      uptimePercentage: uptimePercentage || 100,
      peerId,
      startTime: new Date(),
    });

    res.json({
      success: true,
      message: `Session recorded: ${result.sessionReward} PEPETOR earned`,
      data: result,
    });
  } catch (error) {
    logger.error('Error recording session:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/rewards/claim
 * Claim pending rewards and transfer to user's Solana wallet
 * Body: { walletAddress }
 */
router.post('/claim', requireAuth, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Solana wallet address required',
      });
    }

    const result = await rewardService.claimRewards(req.user.id, walletAddress);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error claiming rewards:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rewards/leaderboard
 * Get top miners leaderboard
 * Query: ?limit=10
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const leaderboard = await rewardService.getLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rewards/stats
 * Get network-wide reward statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await rewardService.getNetworkStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/rewards/referral
 * Add referral bonus (called when new user joins with referral link)
 * Body: { referredUserId }
 */
router.post('/referral', requireAuth, async (req, res) => {
  try {
    const { referredUserId } = req.body;

    if (!referredUserId) {
      return res.status(400).json({
        success: false,
        error: 'referredUserId required',
      });
    }

    const bonus = await rewardService.addReferralBonus(req.user.id, referredUserId);

    res.json({
      success: true,
      message: `Referral bonus awarded: ${bonus} PEPETOR`,
      data: { bonus },
    });
  } catch (error) {
    logger.error('Error adding referral bonus:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rewards/history
 * Get user's claim history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('claimHistory');

    res.json({
      success: true,
      data: {
        history: user.claimHistory || [],
      },
    });
  } catch (error) {
    logger.error('Error getting claim history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/rewards/verify-wallet
 * Verify and register Solana wallet address
 * Body: { walletAddress }
 */
router.post('/verify-wallet', requireAuth, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required',
      });
    }

    // Basic validation (Solana addresses are 32 bytes base58)
    if (!/^[1-9A-HJ-NP-Z]{32,44}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address format',
      });
    }

    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { solanaWallet: walletAddress },
      { new: true }
    ).select('solanaWallet');

    res.json({
      success: true,
      message: 'Wallet address registered',
      data: { walletAddress: user.solanaWallet },
    });
  } catch (error) {
    logger.error('Error verifying wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================
// ADMIN ROUTES (PROTECTED)
// ========================

/**
 * POST /api/rewards/admin/batch-update
 * Batch update rewards for active miners (admin only)
 * Body: { sessions: [{ userId, durationMinutes, ... }] }
 */
router.post('/admin/batch-update', requireAuth, async (req, res) => {
  try {
    // Check admin role (add your admin check here)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { sessions } = req.body;

    if (!Array.isArray(sessions)) {
      return res.status(400).json({
        success: false,
        error: 'sessions must be an array',
      });
    }

    const results = await rewardService.batchUpdateRewards(sessions);

    res.json({
      success: true,
      data: {
        processed: results.length,
        results,
      },
    });
  } catch (error) {
    logger.error('Error batch updating:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rewards/admin/config
 * Get reward system configuration (admin only)
 */
router.get('/admin/config', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const config = {
      baseRatePerMinute: 0.001,
      uptime: {
        multiplier1h: 1.1,
        multiplier8h: 1.25,
        multiplier24h: 1.5,
      },
      referralBonus: 10,
      minClaimAmount: 1,
      claimFrequency: '24 hours',
      tokenMint: process.env.SOLANA_PEPETOR_MINT || 'NOT_SET',
      network: process.env.SOLANA_NETWORK || 'mainnet-beta',
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Error getting config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================
// ERROR HANDLER
// ========================

router.use((error, req, res, next) => {
  logger.error('Reward route error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

module.exports = router;