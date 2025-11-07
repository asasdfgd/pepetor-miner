const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    // Client identity (Ed25519 public key in base64)
    clientPub: {
      type: String,
      required: [true, 'Client public key is required'],
      index: true,
    },
    
    // Session identification
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
    },
    
    // Timing (Unix timestamps in milliseconds)
    startTs: {
      type: Number,
      required: [true, 'Start timestamp is required'],
    },
    endTs: {
      type: Number,
      required: [true, 'End timestamp is required'],
    },
    
    // Data transfer metrics (bytes)
    bytesIn: {
      type: Number,
      required: [true, 'Bytes in is required'],
      min: [0, 'Bytes in cannot be negative'],
    },
    bytesOut: {
      type: Number,
      required: [true, 'Bytes out is required'],
      min: [0, 'Bytes out cannot be negative'],
    },
    
    // SOCKS5 proxy port
    socksPort: {
      type: Number,
      default: 9050,
    },
    
    // Ed25519 signature (base64 encoded)
    signature: {
      type: String,
      required: [true, 'Signature is required'],
    },

    // IP hash (client identifier, optional)
    ipHash: {
      type: String,
      default: null,
    },

    // Canonical JSON hash and byte length
    canonicalHashB64: {
      type: String,
      index: true,
      default: null,
    },
    canonicalBytes: {
      type: Number,
      default: 0,
    },
    
    // Validation status
    isValid: {
      type: Boolean,
      default: false,
    },
    
    // Credits granted based on heuristics policy
    creditsGranted: {
      type: Number,
      default: 0,
      min: [0, 'Credits cannot be negative'],
    },
    
    // Validation details for debugging
    validationDetails: {
      signatureValid: {
        type: Boolean,
        default: false,
      },
      minDurationValid: {
        type: Boolean,
        default: false,
      },
      minBytesValid: {
        type: Boolean,
        default: false,
      },
      replayCheckValid: {
        type: Boolean,
        default: false,
      },
    },
    
    // For tracking if this session was already submitted (replay attack prevention)
    replayChecked: {
      type: Boolean,
      default: false,
    },
    
    // Error message if validation failed
    validationError: {
      type: String,
      default: null,
    },
    
    // Solana transaction signature for token transfer
    tokenTransferSignature: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for replay detection
sessionSchema.index({ clientPub: 1, sessionId: 1 }, { unique: true });

// Calculate duration in seconds
sessionSchema.methods.getDuration = function() {
  return (this.endTs - this.startTs) / 1000; // Convert from ms to seconds
};

// Calculate total bytes transferred
sessionSchema.methods.getTotalBytes = function() {
  return this.bytesIn + this.bytesOut;
};

// Create a payload object matching what was signed
// NOTE: Must match exactly what the client signed (without socks_port)
sessionSchema.methods.getSignedPayload = function() {
  return {
    client_pub: this.clientPub,
    session_id: this.sessionId,
    start_ts: this.startTs,
    end_ts: this.endTs,
    bytes_in: this.bytesIn,
    bytes_out: this.bytesOut,
  };
};

module.exports = mongoose.model('Session', sessionSchema);