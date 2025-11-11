const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    
    // Mining & Rewards
    pendingRewards: {
      type: Number,
      default: 0,
    },
    totalPepetorEarned: {
      type: Number,
      default: 0,
    },
    claimedRewards: {
      type: Number,
      default: 0,
    },
    lastRewardClaim: {
      type: Date,
      default: null,
    },
    lastClaimTx: {
      type: String,
      default: null,
    },
    solanaWallet: {
      type: String,
      default: null,
    },
    
    // Mining Sessions
    miningSessions: [{
      startTime: Date,
      duration: Number,
      reward: Number,
      bytesTransferred: Number,
      peerId: String,
      isTorMode: { type: Boolean, default: false },
      luckyBlockHit: { type: Boolean, default: false },
      luckyBlockAmount: { type: Number, default: 0 },
    }],
    
    // Streak System
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastMiningDate: {
      type: Date,
      default: null,
    },
    lastActivityTime: {
      type: Date,
      default: null,
    },
    
    // Level & XP System
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    xp: {
      type: Number,
      default: 0,
    },
    
    // Daily Tracking
    dailyEarnings: {
      type: Number,
      default: 0,
    },
    dailyEarningsResetDate: {
      type: Date,
      default: null,
    },
    
    // Staking
    stakingBalance: {
      type: Number,
      default: 0,
    },
    
    // Referrals
    referrals: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralBonuses: [{
      referredUserId: mongoose.Schema.Types.ObjectId,
      bonus: Number,
      date: Date,
    }],
    
    // Task Rewards
    tasksCompleted: [{
      taskType: String,
      reward: Number,
      completedAt: Date,
    }],
    
    // Claim History
    claimHistory: [{
      amount: Number,
      wallet: String,
      txHash: String,
      date: Date,
    }],
    
    // Tutorial
    hasSeenTutorial: {
      type: Boolean,
      default: false,
    },
    
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.email && !this.walletAddress) {
    return next(new Error('Either email or wallet address is required'));
  }
  
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
