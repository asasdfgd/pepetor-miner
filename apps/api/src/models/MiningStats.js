const mongoose = require('mongoose');

const MiningStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  totalHashes: {
    type: Number,
    default: 0,
  },
  rewardsEarned: {
    type: Number,
    default: 0,
  },
  miningSessionDuration: {
    type: Number,
    default: 0, // in seconds
  },
}, { timestamps: true });

module.exports = mongoose.model('MiningStats', MiningStatsSchema);