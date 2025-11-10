const LiquidityCommitment = require('../models/LiquidityCommitment');
const DeployedToken = require('../models/DeployedToken');
const escrowService = require('../services/escrowService');

const createCommitment = async (req, res) => {
  try {
    const { walletAddress, tokenMint, amountSOL } = req.body;

    if (!walletAddress || !tokenMint || !amountSOL) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, tokenMint, amountSOL',
      });
    }

    if (amountSOL < 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Minimum commitment amount is 0.01 SOL',
      });
    }

    const token = await DeployedToken.findOne({ mintAddress: tokenMint });
    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'Token not found',
      });
    }

    if (!token.useBondingCurve) {
      return res.status(400).json({
        success: false,
        error: 'Token does not use bonding curve',
      });
    }

    if (token.isMigrated) {
      return res.status(400).json({
        success: false,
        error: 'Token has already migrated to DEX',
      });
    }

    const escrowData = await escrowService.createCommitment({
      userWallet: walletAddress,
      tokenMint,
      amountSOL,
    });

    const totalCommitted = await LiquidityCommitment.getTotalCommittedForToken(tokenMint);
    const estimatedLPTokens = calculateEstimatedLPTokens(amountSOL, totalCommitted);
    const estimatedAPY = calculateEstimatedAPY(totalCommitted);

    const commitment = new LiquidityCommitment({
      walletAddress,
      tokenMint,
      amountSOL,
      escrowAddress: escrowData.escrowAddress,
      escrowBump: escrowData.bump,
      commitmentSignature: '',
      estimatedLPTokens,
      estimatedAPY,
    });

    await commitment.save();

    res.json({
      success: true,
      commitment: {
        id: commitment._id,
        escrowAddress: escrowData.escrowAddress,
        transaction: escrowData.transaction,
        blockhash: escrowData.blockhash,
        lastValidBlockHeight: escrowData.lastValidBlockHeight,
        estimatedLPTokens,
        estimatedAPY,
      },
    });
  } catch (error) {
    console.error('Error creating commitment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const confirmCommitment = async (req, res) => {
  try {
    const { commitmentId, signature } = req.body;

    if (!commitmentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: commitmentId, signature',
      });
    }

    const commitment = await LiquidityCommitment.findById(commitmentId);
    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found',
      });
    }

    const isVerified = await escrowService.verifyCommitment(
      commitment.escrowAddress,
      commitment.amountSOL
    );

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Escrow verification failed',
      });
    }

    commitment.commitmentSignature = signature;
    await commitment.save();

    res.json({
      success: true,
      commitment,
    });
  } catch (error) {
    console.error('Error confirming commitment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getCommitmentsForToken = async (req, res) => {
  try {
    const { tokenMint } = req.params;

    const commitments = await LiquidityCommitment.find({
      tokenMint,
      status: { $in: ['pending', 'fulfilled'] },
    }).sort({ createdAt: -1 });

    const totalCommitted = await LiquidityCommitment.getTotalCommittedForToken(tokenMint);

    res.json({
      success: true,
      commitments,
      totalCommitted,
      count: commitments.length,
    });
  } catch (error) {
    console.error('Error getting commitments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getUserCommitments = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const commitments = await LiquidityCommitment.find({
      walletAddress,
      status: { $in: ['pending', 'fulfilled'] },
    })
      .sort({ createdAt: -1 })
      .populate('tokenMint');

    res.json({
      success: true,
      commitments,
      count: commitments.length,
    });
  } catch (error) {
    console.error('Error getting user commitments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const cancelCommitment = async (req, res) => {
  try {
    const { commitmentId } = req.params;

    const commitment = await LiquidityCommitment.findById(commitmentId);
    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found',
      });
    }

    if (commitment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel pending commitments',
      });
    }

    const token = await DeployedToken.findOne({ mintAddress: commitment.tokenMint });
    if (token && token.isMigrated) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel - token has already migrated',
      });
    }

    const refundSignature = await escrowService.refundCommitment({
      escrowAddress: commitment.escrowAddress,
      userWallet: commitment.walletAddress,
    });

    commitment.status = 'refunded';
    commitment.refundSignature = refundSignature;
    commitment.refundedAt = new Date();
    await commitment.save();

    res.json({
      success: true,
      refundSignature,
      commitment,
    });
  } catch (error) {
    console.error('Error cancelling commitment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getCommitmentStats = async (req, res) => {
  try {
    const { tokenMint } = req.params;

    const token = await DeployedToken.findOne({ mintAddress: tokenMint });
    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'Token not found',
      });
    }

    const totalCommitted = await LiquidityCommitment.getTotalCommittedForToken(tokenMint);
    const commitmentCount = await LiquidityCommitment.countDocuments({
      tokenMint,
      status: 'pending',
    });

    const migrationThreshold = token.bondingCurveMigrationMC || 85;
    const currentProgress = (totalCommitted / migrationThreshold) * 100;

    res.json({
      success: true,
      stats: {
        totalCommitted,
        commitmentCount,
        migrationThreshold,
        currentProgress: Math.min(currentProgress, 100),
        estimatedAPY: calculateEstimatedAPY(totalCommitted),
        isMigrated: token.isMigrated,
      },
    });
  } catch (error) {
    console.error('Error getting commitment stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

function calculateEstimatedLPTokens(amountSOL, totalCommitted) {
  const totalLiquidity = totalCommitted + amountSOL;
  const share = amountSOL / totalLiquidity;
  return share * 1000000;
}

function calculateEstimatedAPY(totalCommitted) {
  if (totalCommitted === 0) return 150;
  if (totalCommitted < 10) return 120;
  if (totalCommitted < 30) return 80;
  if (totalCommitted < 50) return 50;
  return 30;
}

module.exports = {
  createCommitment,
  confirmCommitment,
  getCommitmentsForToken,
  getUserCommitments,
  cancelCommitment,
  getCommitmentStats,
};
