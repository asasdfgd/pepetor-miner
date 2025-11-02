/**
 * Credits Policy Engine
 * Determines how many credits to grant based on session metrics
 */

// Configuration (tunable parameters)
const POLICY_CONFIG = {
  // Minimum session duration (seconds)
  MIN_DURATION_SECONDS: 10,
  
  // Minimum bytes transferred (bytes)
  MIN_BYTES_TOTAL: 1024, // 1 KB
  
  // Credit grant rates
  CREDITS_PER_SECOND: 0.1, // 0.1 credits per second
  CREDITS_PER_MB: 0.5, // 0.5 credits per MB
  
  // Caps to prevent abuse
  MAX_CREDITS_PER_SESSION: 100,
};

/**
 * Calculate credits for a session based on heuristics
 * 
 * @param {Object} session - Session object with timing and bytes data
 * @returns {Object} - { creditsGranted: number, breakDown: object, valid: boolean }
 */
function calculateSessionCredits(session) {
  const result = {
    creditsGranted: 0,
    breakDown: {},
    valid: true,
    reasons: [],
  };
  
  // Validation: Check minimum duration
  const durationSeconds = (session.endTs - session.startTs) / 1000;
  if (durationSeconds < POLICY_CONFIG.MIN_DURATION_SECONDS) {
    result.valid = false;
    result.reasons.push(
      `Duration ${durationSeconds.toFixed(2)}s is below minimum ${POLICY_CONFIG.MIN_DURATION_SECONDS}s`
    );
    return result;
  }
  
  // Validation: Check minimum bytes
  const totalBytes = session.bytesIn + session.bytesOut;
  if (totalBytes < POLICY_CONFIG.MIN_BYTES_TOTAL) {
    result.valid = false;
    result.reasons.push(
      `Total bytes ${totalBytes} is below minimum ${POLICY_CONFIG.MIN_BYTES_TOTAL}`
    );
    return result;
  }
  
  // Calculate credits: duration-based
  const durationCredits = durationSeconds * POLICY_CONFIG.CREDITS_PER_SECOND;
  result.breakDown.durationCredits = durationCredits;
  
  // Calculate credits: bytes-based (MB = 1024*1024 bytes)
  const totalMB = totalBytes / (1024 * 1024);
  const bytesCredits = totalMB * POLICY_CONFIG.CREDITS_PER_MB;
  result.breakDown.bytesCredits = bytesCredits;
  
  // Sum credits
  let totalCredits = durationCredits + bytesCredits;
  
  // Apply cap
  if (totalCredits > POLICY_CONFIG.MAX_CREDITS_PER_SESSION) {
    result.breakDown.cappedFrom = totalCredits;
    totalCredits = POLICY_CONFIG.MAX_CREDITS_PER_SESSION;
    result.reasons.push(`Credits capped from ${result.breakDown.cappedFrom} to ${totalCredits}`);
  }
  
  result.creditsGranted = Math.round(totalCredits * 100) / 100; // Round to 2 decimals
  result.breakDown.total = result.creditsGranted;
  
  return result;
}

/**
 * Get current policy config
 */
function getPolicy() {
  return { ...POLICY_CONFIG };
}

/**
 * Update policy config (admin only)
 */
function updatePolicy(newConfig) {
  Object.assign(POLICY_CONFIG, newConfig);
  return { ...POLICY_CONFIG };
}

module.exports = {
  calculateSessionCredits,
  getPolicy,
  updatePolicy,
};