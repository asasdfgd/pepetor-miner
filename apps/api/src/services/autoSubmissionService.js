const { v4: uuidv4 } = require('uuid');
const nacl = require('tweetnacl');
const { getTorManager } = require('./torManager');

/**
 * AutoSubmissionService - Automatically creates and submits sessions based on Tor activity
 * 
 * This service:
 * 1. Monitors Tor activity from TorManager
 * 2. Accumulates activity into session batches
 * 3. Auto-creates session receipts
 * 4. Signs sessions with a system keypair
 * 5. Submits to the session API
 */

class AutoSubmissionService {
  constructor() {
    this.isMonitoring = false;
    this.accumulatedBytes = 0;
    this.accumulatedStartTime = null;
    this.sessionBatchThreshold = {
      minBytes: 100000, // 100KB
      minDuration: 30, // 30 seconds
      maxDuration: 600, // 10 minutes
    };
    
    this.systemKeypair = this.getOrCreateSystemKeypair();
    this.submittedSessions = [];
    this.totalCreditsEarned = 0;
    this.submitCallback = null;
    this.tor = getTorManager();
  }

  /**
   * Get or create system keypair (for auto-submission identity)
   */
  getOrCreateSystemKeypair() {
    // In production, this would be stored securely
    // For now, we generate a deterministic keypair for testing
    const seed = Buffer.from('pepetor-auto-submit-system-key-1'); // Fixed seed for testing
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    
    return {
      publicKey: Buffer.from(keypair.publicKey).toString('hex'),
      secretKey: keypair.secretKey,
      publicKeyBytes: keypair.publicKey,
    };
  }

  /**
   * Start monitoring Tor activity
   */
  startMonitoring(submitCallback = null) {
    if (this.isMonitoring) {
      console.log('[AutoSubmission] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.submitCallback = submitCallback;
    this.accumulatedBytes = 0;
    this.accumulatedStartTime = Date.now();

    console.log('[AutoSubmission] Started monitoring Tor activity');

    // Listen to Tor activity events
    this.tor.on('activity', (activity) => {
      this.recordActivity(activity);
    });

    // Also listen to stats updates
    this.tor.on('stats-update', (stats) => {
      this.checkAndSubmitSession();
    });

    // Check periodically (every 10 seconds)
    this.checkInterval = setInterval(() => {
      this.checkAndSubmitSession();
    }, 10000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.tor.removeAllListeners('activity');
    this.tor.removeAllListeners('stats-update');

    console.log('[AutoSubmission] Stopped monitoring');
  }

  /**
   * Record activity
   */
  recordActivity(activity) {
    if (!this.isMonitoring) return;

    this.accumulatedBytes += activity.bytes;

    if (!this.accumulatedStartTime) {
      this.accumulatedStartTime = Date.now();
    }
  }

  /**
   * Check if session should be submitted
   */
  checkAndSubmitSession() {
    if (!this.isMonitoring || !this.accumulatedStartTime) {
      return false;
    }

    const now = Date.now();
    const durationSeconds = (now - this.accumulatedStartTime) / 1000;

    // Check if thresholds are met
    const bytesMet = this.accumulatedBytes >= this.sessionBatchThreshold.minBytes;
    const minDurationMet = durationSeconds >= this.sessionBatchThreshold.minDuration;
    const maxDurationReached = durationSeconds >= this.sessionBatchThreshold.maxDuration;

    if ((bytesMet && minDurationMet) || maxDurationReached) {
      return this.submitSession();
    }

    return false;
  }

  /**
   * Create and submit a session
   */
  async submitSession() {
    if (this.accumulatedBytes === 0) {
      return false;
    }

    const now = Date.now();
    const durationSeconds = Math.floor((now - this.accumulatedStartTime) / 1000);

    // Create session object
    const sessionData = {
      sessionId: `auto_${uuidv4()}`,
      clientPub: this.systemKeypair.publicKey,
      timestamp: new Date(this.accumulatedStartTime).toISOString(),
      duration: durationSeconds,
      bytesTransferred: this.accumulatedBytes,
      ipHash: `auto_${Math.random().toString(36).substr(2, 12)}`,
    };

    // Sign session
    const signature = this.signSessionData(sessionData);

    // Prepare submission payload
    const payload = {
      ...sessionData,
      signature,
    };

    try {
      // Call submission callback or make direct API call
      if (this.submitCallback) {
        await this.submitCallback(payload);
      } else {
        // Fallback: make HTTP request (requires axios or fetch)
        console.log('[AutoSubmission] Session ready to submit:', {
          sessionId: payload.sessionId,
          bytes: payload.bytesTransferred,
          duration: payload.duration,
        });
      }

      // Track submission
      this.submittedSessions.push({
        ...payload,
        submittedAt: new Date().toISOString(),
      });

      // Estimate credits earned (rough calculation)
      const estimatedCredits = this.estimateCredits(durationSeconds, this.accumulatedBytes);
      this.totalCreditsEarned += estimatedCredits;

      console.log('[AutoSubmission] Session submitted:', {
        id: payload.sessionId,
        bytes: payload.bytesTransferred,
        duration: payload.duration,
        estimatedCredits,
      });

      // Reset accumulation
      this.accumulatedBytes = 0;
      this.accumulatedStartTime = Date.now();

      return true;

    } catch (error) {
      console.error('[AutoSubmission] Failed to submit session:', error);
      return false;
    }
  }

  /**
   * Sign session data
   */
  signSessionData(sessionData) {
    const messageBytes = Buffer.from(JSON.stringify(sessionData));
    const signedMessage = nacl.sign.detached(messageBytes, this.systemKeypair.secretKey);
    return Buffer.from(signedMessage).toString('hex');
  }

  /**
   * Estimate credits for a session
   * Based on the credits policy: 0.1/second + 0.5/MB (max 100/session)
   */
  estimateCredits(durationSeconds, bytesTransferred) {
    const megabytes = bytesTransferred / (1024 * 1024);
    
    const durationCredits = durationSeconds * 0.1;
    const dataCredits = megabytes * 0.5;
    
    const totalCredits = durationCredits + dataCredits;
    return Math.min(totalCredits, 100); // Cap at 100
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isMonitoring: this.isMonitoring,
      accumulatedBytes: this.accumulatedBytes,
      accumulatedSeconds: this.accumulatedStartTime 
        ? Math.floor((Date.now() - this.accumulatedStartTime) / 1000)
        : 0,
      submittedSessions: this.submittedSessions.length,
      totalCreditsEarned: this.totalCreditsEarned.toFixed(2),
      sessionBatchThreshold: this.sessionBatchThreshold,
      systemPublicKey: this.systemKeypair.publicKey,
    };
  }

  /**
   * Get submitted sessions
   */
  getSubmittedSessions(limit = 50) {
    return this.submittedSessions.slice(-limit);
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.submittedSessions = [];
    this.totalCreditsEarned = 0;
    this.accumulatedBytes = 0;
    this.accumulatedStartTime = Date.now();
  }

  /**
   * Update batch thresholds
   */
  updateThresholds(newThresholds) {
    this.sessionBatchThreshold = {
      ...this.sessionBatchThreshold,
      ...newThresholds,
    };
    console.log('[AutoSubmission] Updated thresholds:', this.sessionBatchThreshold);
  }
}

// Singleton instance
let autoSubmissionInstance = null;

/**
 * Get or create AutoSubmissionService singleton
 */
function getAutoSubmissionService() {
  if (!autoSubmissionInstance) {
    autoSubmissionInstance = new AutoSubmissionService();
  }
  return autoSubmissionInstance;
}

module.exports = {
  AutoSubmissionService,
  getAutoSubmissionService,
};