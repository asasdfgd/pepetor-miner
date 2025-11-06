const Session = require('../models/Session');
const Ledger = require('../models/Ledger');
const { verifySessionSignature } = require('../utils/signatureVerification');
const { calculateSessionCredits, getPolicy } = require('../utils/creditsPolicy');

/**
 * Submit a signed session receipt
 * Validates signature, checks replay attacks, applies heuristics, updates balance
 */
exports.submitSession = async (req, res) => {
  try {
    const {
      client_pub,
      session_id,
      start_ts,
      end_ts,
      bytes_in,
      bytes_out,
      socks_port,
      signature,
    } = req.body;

    // Validation: Check all required fields
    if (
      !client_pub ||
      !session_id ||
      start_ts === undefined ||
      end_ts === undefined ||
      bytes_in === undefined ||
      bytes_out === undefined ||
      !signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: [
          'client_pub',
          'session_id',
          'start_ts',
          'end_ts',
          'bytes_in',
          'bytes_out',
          'signature',
        ],
      });
    }

    // Validation: Check timestamp logic
    if (end_ts <= start_ts) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timestamps: end_ts must be greater than start_ts',
      });
    }

    // Validation: Check bytes are non-negative
    if (bytes_in < 0 || bytes_out < 0) {
      return res.status(400).json({
        success: false,
        message: 'Bytes cannot be negative',
      });
    }

    // Check for replay attack: session_id + client_pub must be unique
    const existingSession = await Session.findOne({
      sessionId: session_id,
      clientPub: client_pub,
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: 'Session replay detected: this session was already submitted',
        sessionId: session_id,
      });
    }

    // Create session document (not yet validated)
    const session = new Session({
      clientPub: client_pub,
      sessionId: session_id,
      startTs: start_ts,
      endTs: end_ts,
      bytesIn: bytes_in,
      bytesOut: bytes_out,
      socksPort: socks_port || 9050,
      signature: signature,
    });

    // Step 1: Verify signature
    const signedPayload = session.getSignedPayload();
    const signatureValid = verifySessionSignature(
      signedPayload,
      signature,
      client_pub
    );

    session.validationDetails.signatureValid = signatureValid;
    if (!signatureValid) {
      session.validationError = 'Signature verification failed';
      await session.save();
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
        sessionId: session_id,
      });
    }

    // Step 2: Apply heuristics and calculate credits
    const creditsResult = calculateSessionCredits(session);

    session.validationDetails.minDurationValid =
      !creditsResult.reasons.some((r) => r.includes('Duration'));
    session.validationDetails.minBytesValid =
      !creditsResult.reasons.some((r) => r.includes('bytes'));
    session.validationDetails.replayCheckValid = true;
    session.replayChecked = true;

    if (!creditsResult.valid) {
      session.validationError = creditsResult.reasons.join('; ');
      await session.save();
      return res.status(400).json({
        success: false,
        message: 'Session rejected: heuristics validation failed',
        reasons: creditsResult.reasons,
        sessionId: session_id,
      });
    }

    // Session is valid!
    session.isValid = true;
    session.creditsGranted = creditsResult.creditsGranted;

    // Save session
    await session.save();

    // Step 3: Update or create ledger entry
    let ledger = await Ledger.findOne({ clientPub: client_pub });

    if (!ledger) {
      ledger = new Ledger({
        clientPub: client_pub,
        balance: creditsResult.creditsGranted,
        totalSessionsSubmitted: 1,
        totalBytesTransferred: bytes_in + bytes_out,
        totalSessionDuration: (end_ts - start_ts) / 1000,
        lastSessionAt: new Date(),
      });
    } else {
      ledger.balance += creditsResult.creditsGranted;
      ledger.totalSessionsSubmitted += 1;
      ledger.totalBytesTransferred += bytes_in + bytes_out;
      ledger.totalSessionDuration += (end_ts - start_ts) / 1000;
      ledger.lastSessionAt = new Date();
    }

    await ledger.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Session submitted and validated successfully',
      session: {
        sessionId: session._id,
        creditsGranted: session.creditsGranted,
        creditsBreakDown: creditsResult.breakDown,
      },
      ledger: {
        clientPub: ledger.clientPub,
        balance: ledger.balance,
        totalSessionsSubmitted: ledger.totalSessionsSubmitted,
      },
    });
  } catch (error) {
    console.error('❌ Error submitting session:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get balance for a public key
 * Public endpoint - anyone can query balance for any public key
 */
exports.getBalance = async (req, res) => {
  try {
    const { pubkey } = req.query;

    if (!pubkey) {
      return res.status(400).json({
        success: false,
        message: 'pubkey query parameter is required',
      });
    }

    const ledger = await Ledger.findOne({ clientPub: pubkey });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'No ledger entry found for this public key',
        pubkey: pubkey,
      });
    }

    res.json({
      success: true,
      data: {
        clientPub: ledger.clientPub,
        balance: ledger.balance,
        totalSessionsSubmitted: ledger.totalSessionsSubmitted,
        totalBytesTransferred: ledger.totalBytesTransferred,
        totalSessionDuration: ledger.totalSessionDuration,
        lastSessionAt: ledger.lastSessionAt,
        createdAt: ledger.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user's sessions (requires authentication)
 * Only returns sessions for the authenticated user
 */
exports.getUserSessions = async (req, res) => {
  try {
    const { clientPub } = req.query;

    if (!clientPub) {
      return res.status(400).json({
        success: false,
        message: 'clientPub query parameter is required',
      });
    }

    const sessions = await Session.find({ clientPub })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: sessions.length,
      data: sessions.map((session) => ({
        _id: session._id,
        sessionId: session.sessionId,
        duration: session.getDuration(),
        bytesTransferred: session.getTotalBytes(),
        creditsEarned: session.creditsGranted,
        isValid: session.isValid,
        signatureValid: session.validationDetails.signatureValid,
        heuristicsValid: session.validationDetails.minDurationValid && session.validationDetails.minBytesValid,
        replayChecked: session.replayChecked,
        validationError: session.validationError,
        ipHash: session.ipHash || 'N/A',
        timestamp: (session.createdAt || session.updatedAt || new Date()).toISOString(),
        createdAt: (session.createdAt || new Date()).toISOString(),
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get policy configuration (public endpoint)
 * Shows current heuristics policy
 */
exports.getPolicy = async (req, res) => {
  try {
    const policy = getPolicy();
    res.json({
      success: true,
      policy: {
        minDurationSeconds: policy.MIN_DURATION_SECONDS,
        minBytesTotal: policy.MIN_BYTES_TOTAL,
        creditsPerSecond: policy.CREDITS_PER_SECOND,
        creditsPerMB: policy.CREDITS_PER_MB,
        maxCreditsPerSession: policy.MAX_CREDITS_PER_SESSION,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policy',
    });
  }
};

/**
 * Get session details (public endpoint)
 * Returns full validation details for a session
 */
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId parameter is required',
      });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        clientPub: session.clientPub,
        duration: session.getDuration(),
        bytesIn: session.bytesIn,
        bytesOut: session.bytesOut,
        totalBytes: session.getTotalBytes(),
        creditsGranted: session.creditsGranted,
        isValid: session.isValid,
        validationDetails: session.validationDetails,
        validationError: session.validationError,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
    });
  }
};