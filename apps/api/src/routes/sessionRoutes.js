const express = require('express');
const {
  submitSession,
  getBalance,
  getUserSessions,
  getPolicy,
  getSessionDetails,
} = require('../controllers/sessionController');

const router = express.Router();

/**
 * Session Routes
 */

// Public endpoints (no authentication required)

/**
 * POST /api/sessions/submit
 * Submit a signed session receipt
 * 
 * Body:
 * {
 *   "client_pub": "base64-encoded-public-key",
 *   "session_id": "uuid",
 *   "start_ts": 1700000000000,
 *   "end_ts": 1700000010000,
 *   "bytes_in": 12345,
 *   "bytes_out": 54321,
 *   "socks_port": 9050,
 *   "signature": "base64-encoded-signature"
 * }
 */
router.post('/submit', submitSession);

/**
 * GET /api/sessions/balance?pubkey=<base64-pubkey>
 * Get balance for a public key
 * Returns ledger data including current balance and statistics
 */
router.get('/balance', getBalance);

/**
 * GET /api/sessions/policy
 * Get current credits policy
 * Shows heuristics configuration (min duration, min bytes, credit rates, caps)
 */
router.get('/policy', getPolicy);

/**
 * GET /api/sessions/:sessionId
 * Get details of a specific session
 * Returns full validation details and credits information
 */
router.get('/:sessionId', getSessionDetails);

/**
 * GET /api/sessions/by-client?clientPub=<base64-pubkey>
 * Get recent sessions for a client
 * Returns array of recent sessions with timestamps and credits
 */
router.get('/by-client/list', getUserSessions);

module.exports = router;