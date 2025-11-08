const mongoose = require('mongoose');

const deployedTokenSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  tokenName: {
    type: String,
    required: true,
  },
  tokenSymbol: {
    type: String,
    required: true,
  },
  totalSupply: {
    type: Number,
    required: true,
    default: 1_000_000_000,
  },
  decimals: {
    type: Number,
    required: true,
    default: 9,
  },
  mintAddress: {
    type: String,
  },
  treasuryWallet: {
    type: String,
  },
  rewardsWallet: {
    type: String,
  },
  liquidityWallet: String,
  marketingWallet: String,
  description: String,
  logoUrl: String,
  metadataUri: String,
  paymentMethod: {
    type: String,
    enum: ['SOL', 'PEPETOR'],
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentSignature: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'deployed', 'failed'],
    default: 'pending',
  },
  deploymentSignature: String,
  network: {
    type: String,
    enum: ['mainnet-beta', 'devnet'],
    default: 'mainnet-beta',
  },
  deployedAt: Date,
  expiresAt: Date,
}, {
  timestamps: true,
});

deployedTokenSchema.index({ owner: 1, createdAt: -1 });
deployedTokenSchema.index({ status: 1, createdAt: -1 });
deployedTokenSchema.index({ mintAddress: 1 });

module.exports = mongoose.model('DeployedToken', deployedTokenSchema);
