const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    // Client public key (Ed25519 public key in base64)
    clientPub: {
      type: String,
      required: [true, 'Client public key is required'],
      unique: true,
      index: true,
    },
    
    // Total credits balance
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    
    // Lifetime stats
    totalSessionsSubmitted: {
      type: Number,
      default: 0,
      min: [0, 'Cannot be negative'],
    },
    
    totalBytesTransferred: {
      type: Number,
      default: 0,
      min: [0, 'Cannot be negative'],
    },
    
    totalSessionDuration: {
      type: Number, // in seconds
      default: 0,
      min: [0, 'Cannot be negative'],
    },
    
    // Last activity
    lastSessionAt: {
      type: Date,
      default: null,
    },
    
    // Rejection tracking
    totalRejected: {
      type: Number,
      default: 0,
      min: [0, 'Cannot be negative'],
    },
    
    rejectionReasons: [{
      reason: String,
      count: Number,
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Ledger', ledgerSchema);