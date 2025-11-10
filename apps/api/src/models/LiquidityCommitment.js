const mongoose = require('mongoose');

const liquidityCommitmentSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    trim: true,
  },
  tokenMint: {
    type: String,
    required: true,
    trim: true,
  },
  amountSOL: {
    type: Number,
    required: true,
    min: 0.01,
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled', 'refunded'],
    default: 'pending',
  },
  escrowAddress: {
    type: String,
    required: true,
    trim: true,
  },
  escrowBump: {
    type: Number,
    required: true,
  },
  lpTokensReceived: {
    type: Number,
    default: 0,
  },
  commitmentSignature: {
    type: String,
    required: true,
    trim: true,
  },
  fulfillmentSignature: {
    type: String,
    default: null,
  },
  refundSignature: {
    type: String,
    default: null,
  },
  fulfilledAt: {
    type: Date,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  estimatedAPY: {
    type: Number,
    default: null,
  },
  estimatedLPTokens: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

liquidityCommitmentSchema.index({ walletAddress: 1, createdAt: -1 });
liquidityCommitmentSchema.index({ tokenMint: 1, status: 1 });
liquidityCommitmentSchema.index({ status: 1, createdAt: -1 });
liquidityCommitmentSchema.index({ escrowAddress: 1 });

liquidityCommitmentSchema.statics.getTotalCommittedForToken = async function(tokenMint) {
  const result = await this.aggregate([
    { $match: { tokenMint, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amountSOL' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

liquidityCommitmentSchema.statics.getUserCommitmentsForToken = async function(walletAddress, tokenMint) {
  return this.find({ walletAddress, tokenMint, status: { $in: ['pending', 'fulfilled'] } });
};

module.exports = mongoose.model('LiquidityCommitment', liquidityCommitmentSchema);
