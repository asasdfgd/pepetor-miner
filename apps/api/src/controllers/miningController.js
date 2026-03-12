const MiningStats = require('../models/MiningStats');

const miningService = require('../services/miningService');

exports.getJob = async (req, res) => {
  if (!miningService.currentJob) {
    return res.status(503).json({ message: 'No mining job available from the pool yet. Please try again in a moment.' });
  }
  res.json(miningService.currentJob);
};

exports.submitHash = async (req, res) => {
  const { job_id, nonce, result } = req.body;

  if (!job_id || !nonce || !result) {
    return res.status(400).json({ message: 'Missing required fields: job_id, nonce, result' });
  }

  try {
    // Forward the work to the mining pool
    miningService.submitWork([miningService.poolConfig.worker, job_id, nonce, result]);

    // Update user stats
    const stats = await MiningStats.findOneAndUpdate(
      { user: req.user.id },
      { 
        $inc: { totalHashes: 1 },
        $setOnInsert: { walletAddress: req.user.walletAddress } 
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Hash submitted successfully', totalHashes: stats.totalHashes });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting hash', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await MiningStats.findOne({ user: req.user.id });
    if (!stats) {
      return res.status(404).json({ message: 'No mining stats found for this user.' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

exports.withdrawRewards = async (req, res) => {
  try {
    const stats = await MiningStats.findOne({ user: req.user.id });
    if (!stats || stats.totalHashes === 0) {
      return res.status(400).json({ message: 'No hashes mined yet.' });
    }

    const rewards = miningService.calculateRewards(stats.totalHashes);

    // In a real-world scenario, you would trigger a transaction to the user's wallet here.
    // For now, we'll just update the stats.

    stats.rewardsEarned += rewards;
    stats.totalHashes = 0; // Reset hashes after withdrawal
    await stats.save();

    res.json({ message: 'Rewards withdrawn successfully', withdrawnAmount: rewards, newTotalHashes: stats.totalHashes });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing rewards', error: error.message });
  }
};