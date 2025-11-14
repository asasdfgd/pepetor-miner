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
  treasuryKeypair: {
    type: [Number],
  },
  rewardsKeypair: {
    type: [Number],
  },
  liquidityKeypair: {
    type: [Number],
  },
  marketingKeypair: {
    type: [Number],
  },
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
  marketId: String,
  poolAddress: String,
  useBondingCurve: {
    type: Boolean,
    default: false,
  },
  bondingCurvePool: {
    type: String,
    default: null,
  },
  bondingCurveConfig: {
    type: String,
    default: null,
  },
  bondingCurveInitialMC: {
    type: Number,
    default: 30,
  },
  bondingCurveMigrationMC: {
    type: Number,
    default: 85,
  },
  tradingUrl: {
    type: String,
    default: null,
  },
  isMigrated: {
    type: Boolean,
    default: false,
  },
  migratedPoolAddress: {
    type: String,
    default: null,
  },
  deployedAt: Date,
  expiresAt: Date,
  errorMessage: String,
}, {
  timestamps: true,
});

deployedTokenSchema.index({ owner: 1, createdAt: -1 });
deployedTokenSchema.index({ status: 1, createdAt: -1 });
deployedTokenSchema.index({ mintAddress: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('DeployedToken', deployedTokenSchema);
