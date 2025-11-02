const express = require('express');
const { getTorManager } = require('../services/torManager');
const { getAutoSubmissionService } = require('../services/autoSubmissionService');

const router = express.Router();

/**
 * Tor Management Routes
 * These endpoints allow the frontend to control and monitor the Tor process
 */

const tor = getTorManager();
const autoSubmission = getAutoSubmissionService();

/**
 * POST /api/tor/start
 * Start the Tor process
 */
router.post('/start', async (req, res) => {
  try {
    if (tor.isRunning) {
      return res.json({
        success: true,
        message: 'Tor is already running',
        status: tor.getHealth(),
      });
    }

    console.log('[TorAPI] Starting Tor...');
    const result = await tor.start();

    res.json({
      success: true,
      message: result.message,
      status: tor.getHealth(),
    });

  } catch (error) {
    console.error('[TorAPI] Error starting Tor:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Make sure Tor is installed: brew install tor (macOS) or apt-get install tor (Linux)',
    });
  }
});

/**
 * POST /api/tor/stop
 * Stop the Tor process
 */
router.post('/stop', async (req, res) => {
  try {
    if (!tor.isRunning) {
      return res.json({
        success: true,
        message: 'Tor is already stopped',
      });
    }

    console.log('[TorAPI] Stopping Tor...');
    autoSubmission.stopMonitoring();
    const result = await tor.stop();

    res.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('[TorAPI] Error stopping Tor:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/debug
 * Debug endpoint to diagnose Tor issues
 */
router.get('/debug', async (req, res) => {
  try {
    const os = require('os');
    const { execSync } = require('child_process');
    
    const debug = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        node_version: process.version,
      },
      tor_binary: {
        found: false,
        path: null,
        version: null,
        error: null,
      },
      environment: {
        TOR_SOCKS_PORT: process.env.TOR_SOCKS_PORT || '9050',
        TOR_CONTROL_PORT: process.env.TOR_CONTROL_PORT || '9051',
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    };

    // Try to find and test Tor binary
    try {
      const torVersion = execSync('tor --version 2>&1', { 
        timeout: 5000,
        encoding: 'utf-8',
      }).trim();
      debug.tor_binary.found = true;
      debug.tor_binary.version = torVersion;
      
      try {
        const torPath = execSync('which tor', { encoding: 'utf-8' }).trim();
        debug.tor_binary.path = torPath;
      } catch (e) {
        // which might fail even if tor works
      }
    } catch (e) {
      debug.tor_binary.found = false;
      debug.tor_binary.error = e.message;
    }

    res.json(debug);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/status
 * Get current Tor status
 */
router.get('/status', (req, res) => {
  try {
    const status = tor.getHealth();
    const stats = tor.getStats();
    const autoSubmitStats = autoSubmission.getStats();
    const monitorInfo = tor.getTrafficMonitorInfo();

    res.json({
      success: true,
      tor: {
        status: status.status,
        socksPort: status.socksPort,
        controlPort: status.controlPort,
        uptime: status.uptime,
      },
      stats: {
        bytesIn: stats.bytesIn,
        bytesOut: stats.bytesOut,
        totalBytes: stats.totalBytes,
        connectionCount: stats.connectionCount,
        circuitCount: stats.circuitCount,
      },
      trafficMonitor: monitorInfo,
      autoSubmission: {
        isMonitoring: autoSubmitStats.isMonitoring,
        accumulatedBytes: autoSubmitStats.accumulatedBytes,
        accumulatedSeconds: autoSubmitStats.accumulatedSeconds,
        submittedSessions: autoSubmitStats.submittedSessions,
        totalCreditsEarned: autoSubmitStats.totalCreditsEarned,
      },
    });

  } catch (error) {
    console.error('[TorAPI] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/traffic-config
 * Get traffic monitor configuration for browser proxy setup
 */
router.get('/traffic-config', (req, res) => {
  try {
    const monitorInfo = tor.getTrafficMonitorInfo();

    if (!monitorInfo) {
      return res.status(400).json({
        success: false,
        error: 'Traffic monitor not running. Start Tor and monitoring first.',
      });
    }

    res.json({
      success: true,
      config: {
        // Chrome extension should configure browser to use this proxy
        proxyServer: `socks5://127.0.0.1:${monitorInfo.proxyPort}`,
        proxyPort: monitorInfo.proxyPort,
        host: '127.0.0.1',
        bypassList: ['localhost', '127.0.0.1'],
        description: 'PEPETOR traffic monitoring proxy - forwards to Tor',
      },
      monitor: monitorInfo,
    });

  } catch (error) {
    console.error('[TorAPI] Error getting traffic config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/traffic-stats
 * Get detailed traffic statistics
 */
router.get('/traffic-stats', (req, res) => {
  try {
    const monitorInfo = tor.getTrafficMonitorInfo();

    if (!monitorInfo) {
      return res.json({
        success: true,
        stats: null,
        message: 'Traffic monitor not running',
      });
    }

    res.json({
      success: true,
      stats: monitorInfo.stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[TorAPI] Error getting traffic stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/activity
 * Get recent activity data (for charts)
 */
router.get('/activity', (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 5;
    const activity = tor.getRecentActivity(minutes);

    res.json({
      success: true,
      minutes,
      activityCount: activity.length,
      activity,
    });

  } catch (error) {
    console.error('[TorAPI] Error getting activity:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/monitoring/start
 * Start auto-submission monitoring
 */
router.post('/monitoring/start', async (req, res) => {
  try {
    if (!tor.isRunning) {
      return res.status(400).json({
        success: false,
        error: 'Tor must be running to start monitoring',
      });
    }

    autoSubmission.startMonitoring();

    res.json({
      success: true,
      message: 'Auto-submission monitoring started',
      stats: autoSubmission.getStats(),
    });

  } catch (error) {
    console.error('[TorAPI] Error starting monitoring:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/monitoring/stop
 * Stop auto-submission monitoring
 */
router.post('/monitoring/stop', (req, res) => {
  try {
    autoSubmission.stopMonitoring();

    res.json({
      success: true,
      message: 'Auto-submission monitoring stopped',
      stats: autoSubmission.getStats(),
    });

  } catch (error) {
    console.error('[TorAPI] Error stopping monitoring:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/monitoring/stats
 * Get auto-submission statistics
 */
router.get('/monitoring/stats', (req, res) => {
  try {
    const stats = autoSubmission.getStats();

    res.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('[TorAPI] Error getting monitoring stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tor/monitoring/sessions
 * Get list of auto-submitted sessions
 */
router.get('/monitoring/sessions', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sessions = autoSubmission.getSubmittedSessions(limit);

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });

  } catch (error) {
    console.error('[TorAPI] Error getting monitoring sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/simulate
 * Start simulating Tor activity (for testing without actual Tor)
 */
router.post('/simulate', (req, res) => {
  try {
    if (tor.isRunning) {
      return res.status(400).json({
        success: false,
        error: 'Cannot simulate while real Tor is running',
      });
    }

    // Create a mock Tor with simulated activity
    console.log('[TorAPI] Starting simulation mode...');
    
    tor.isRunning = true;
    tor.stats.startTime = Date.now();

    // Simulate activity every 2 seconds
    tor.simulationInterval = setInterval(() => {
      tor.simulateActivity();
    }, 2000);

    // Start auto-submission
    autoSubmission.startMonitoring();

    res.json({
      success: true,
      message: 'Simulation mode started (simulating Tor activity)',
      status: tor.getHealth(),
    });

  } catch (error) {
    console.error('[TorAPI] Error starting simulation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/simulate/stop
 * Stop simulating Tor activity
 */
router.post('/simulate/stop', (req, res) => {
  try {
    if (tor.simulationInterval) {
      clearInterval(tor.simulationInterval);
      tor.simulationInterval = null;
    }

    autoSubmission.stopMonitoring();
    tor.isRunning = false;
    tor.resetStats();

    res.json({
      success: true,
      message: 'Simulation mode stopped',
    });

  } catch (error) {
    console.error('[TorAPI] Error stopping simulation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/thresholds
 * Update auto-submission batch thresholds
 */
router.post('/thresholds', (req, res) => {
  try {
    const { minBytes, minDuration, maxDuration } = req.body;

    const newThresholds = {};
    if (minBytes !== undefined) newThresholds.minBytes = minBytes;
    if (minDuration !== undefined) newThresholds.minDuration = minDuration;
    if (maxDuration !== undefined) newThresholds.maxDuration = maxDuration;

    autoSubmission.updateThresholds(newThresholds);

    res.json({
      success: true,
      message: 'Thresholds updated',
      thresholds: autoSubmission.getStats().sessionBatchThreshold,
    });

  } catch (error) {
    console.error('[TorAPI] Error updating thresholds:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tor/reset
 * Reset all statistics
 */
router.post('/reset', (req, res) => {
  try {
    autoSubmission.resetStats();
    tor.resetStats();

    res.json({
      success: true,
      message: 'Statistics reset',
    });

  } catch (error) {
    console.error('[TorAPI] Error resetting:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;