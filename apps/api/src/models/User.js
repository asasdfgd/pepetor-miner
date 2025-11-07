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

module.exports = mongoose.model('User', userSchema);
