const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { EventEmitter } = require('events');
const { getTrafficMonitor } = require('./trafficMonitor');

/**
 * TorManager - Manages Tor process lifecycle and activity monitoring
 * Note: This requires Tor to be installed on the system
 * 
 * macOS: brew install tor
 * Linux: apt-get install tor
 * Windows: Download from torproject.org
 */

class TorManager extends EventEmitter {
  constructor() {
    super();
    this.torProcess = null;
    this.isRunning = false;
    this.trafficMonitor = getTrafficMonitor();
    this.config = {
      socksPort: process.env.TOR_SOCKS_PORT || 9050,
      controlPort: process.env.TOR_CONTROL_PORT || 9051,
      dataDirectory: path.join(os.tmpdir(), 'pepetor-tor-data'),
      logLevel: process.env.TOR_LOG_LEVEL || 'warn',
    };
    
    this.stats = {
      startTime: null,
      bytesIn: 0,
      bytesOut: 0,
      connectionCount: 0,
      circuitCount: 0,
      uptime: 0,
    };

    this.activityLog = [];
    this.maxActivityLogSize = 1000;
  }

  /**
   * Start Tor process
   */
  async start() {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        return reject(new Error('Tor is already running'));
      }

      try {
        // Ensure data directory exists
        if (!fs.existsSync(this.config.dataDirectory)) {
          fs.mkdirSync(this.config.dataDirectory, { recursive: true });
        }

        console.log('[TOR] Starting Tor process...');
        console.log('[TOR] SOCKS Port:', this.config.socksPort);
        console.log('[TOR] Control Port:', this.config.controlPort);
        console.log('[TOR] Data Dir:', this.config.dataDirectory);

        // Spawn Tor process
        this.torProcess = spawn('tor', [
          '--SocksPort', this.config.socksPort.toString(),
          '--ControlPort', this.config.controlPort.toString(),
          '--DataDirectory', this.config.dataDirectory,
          '--Log', `${this.config.logLevel} file ${path.join(this.config.dataDirectory, 'tor.log')}`,
          '--DisableNetwork', '0',
          '--ClientOnly', '1',
        ], {
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false,
        });

        if (!this.torProcess) {
          throw new Error('Failed to spawn Tor process');
        }

        const torErrors = [];

        // Handle Tor stdout
        this.torProcess.stdout.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            console.log('[TOR stdout]', output);
            
            // Check for bootstrap status
            if (output.includes('Bootstrapped') || output.includes('100%')) {
              if (!this.isRunning) {
                this.isRunning = true;
                this.stats.startTime = Date.now();
                
                // Start traffic monitor
                this.startTrafficMonitoring();
                
                this.emit('started');
                resolve({ success: true, message: 'Tor started successfully' });
              }
            }
          }
        });

        // Handle Tor stderr
        this.torProcess.stderr.on('data', (data) => {
          const error = data.toString().trim();
          if (error) {
            console.error('[TOR stderr]', error);
            torErrors.push(error);
          }
        });

        // Handle process exit
        this.torProcess.on('exit', (code) => {
          console.log('[TOR] Process exited with code:', code);
          this.isRunning = false;
          this.torProcess = null;
          this.emit('stopped');
        });

        // Handle process errors
        this.torProcess.on('error', (err) => {
          console.error('[TOR] Process error:', err);
          this.isRunning = false;
          this.torProcess = null;
          this.emit('error', err);
          reject(err);
        });

        // Set timeout for bootstrap
        const bootstrapTimeout = setTimeout(() => {
          if (!this.isRunning && this.torProcess) {
            this.stop().catch(console.error);
            reject(new Error('Tor bootstrap timeout - make sure Tor is installed: brew install tor'));
          }
        }, 30000);

        // Clear timeout if started
        this.on('started', () => clearTimeout(bootstrapTimeout));

      } catch (error) {
        console.error('[TOR] Failed to start:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop Tor process
   */
  async stop() {
    return new Promise((resolve) => {
      if (!this.torProcess) {
        this.isRunning = false;
        return resolve({ success: true, message: 'Tor already stopped' });
      }

      console.log('[TOR] Stopping Tor process...');
      
      // Stop traffic monitor
      this.stopTrafficMonitoring();

      const killTimeout = setTimeout(() => {
        console.log('[TOR] Force killing process...');
        this.torProcess.kill('SIGKILL');
      }, 5000);

      this.torProcess.on('exit', () => {
        clearTimeout(killTimeout);
        this.isRunning = false;
        this.torProcess = null;
        resolve({ success: true, message: 'Tor stopped' });
      });

      this.torProcess.kill('SIGTERM');
    });
  }

  /**
   * Start traffic monitoring proxy
   */
  async startTrafficMonitoring() {
    try {
      console.log('[TOR] Attempting to start traffic monitor...');
      const result = await this.trafficMonitor.start();
      console.log('[TOR] Traffic monitor started successfully:', result);

      // Listen for connection closes to record activity
      this.trafficMonitor.on('connection-closed', (connData) => {
        // Record bytes from this connection
        this.recordActivity(connData.bytesIn, 'in');
        this.recordActivity(connData.bytesOut, 'out');
        
        // Emit activity event
        this.emit('activity', { 
          bytes: connData.totalBytes, 
          direction: 'both',
          connection: connData,
        });
      });

      return result;
    } catch (error) {
      console.warn('[TOR] Failed to start traffic monitor (non-fatal):', error.message);
      console.warn('[TOR] Continuing without traffic monitoring - using simulation mode');
      // This is not fatal - fall back to simulation
      return null;
    }
  }

  /**
   * Stop traffic monitoring proxy
   */
  async stopTrafficMonitoring() {
    try {
      await this.trafficMonitor.stop();
      console.log('[TOR] Traffic monitor stopped');
    } catch (error) {
      console.error('[TOR] Error stopping traffic monitor:', error);
    }
  }

  /**
   * Get traffic monitor info (for extension configuration)
   */
  getTrafficMonitorInfo() {
    if (!this.trafficMonitor || !this.trafficMonitor.isRunning) {
      return null;
    }

    return {
      proxyPort: 9149, // Hardcoded in trafficMonitor
      torPort: this.config.socksPort,
      stats: this.trafficMonitor.getStats(),
    };
  }

  /**
   * Record activity (called by monitor)
   */
  recordActivity(bytes, direction = 'in') {
    const now = Date.now();
    
    if (direction === 'in') {
      this.stats.bytesIn += bytes;
    } else {
      this.stats.bytesOut += bytes;
    }

    this.activityLog.push({
      timestamp: now,
      bytes,
      direction,
    });

    // Keep activity log bounded
    if (this.activityLog.length > this.maxActivityLogSize) {
      this.activityLog = this.activityLog.slice(-this.maxActivityLogSize);
    }

    this.emit('activity', { bytes, direction, timestamp: now });
  }

  /**
   * Simulate Tor activity (for testing when Tor isn't installed)
   * This is replaced with real monitoring in production
   */
  simulateActivity() {
    const bytesPerSecond = Math.random() * 100000 + 50000; // 50KB - 150KB/s
    
    this.recordActivity(Math.floor(bytesPerSecond * 0.6), 'in');
    this.recordActivity(Math.floor(bytesPerSecond * 0.4), 'out');
    
    this.stats.connectionCount = Math.floor(Math.random() * 50) + 10;
    this.stats.circuitCount = Math.floor(Math.random() * 5) + 1;
    
    this.emit('stats-update', this.getStats());
  }

  /**
   * Get current stats
   */
  getStats() {
    const uptime = this.isRunning ? Math.floor((Date.now() - this.stats.startTime) / 1000) : this.stats.uptime;
    const totalBytes = this.stats.bytesIn + this.stats.bytesOut;
    
    return {
      isRunning: this.isRunning,
      uptime,
      bytesIn: this.stats.bytesIn,
      bytesOut: this.stats.bytesOut,
      totalBytes,
      connectionCount: this.stats.connectionCount,
      circuitCount: this.stats.circuitCount,
      startTime: this.stats.startTime,
    };
  }

  /**
   * Get recent activity
   */
  getRecentActivity(minutes = 5) {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.activityLog.filter(entry => entry.timestamp > cutoffTime);
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.stats = {
      startTime: this.isRunning ? Date.now() : null,
      bytesIn: 0,
      bytesOut: 0,
      connectionCount: 0,
      circuitCount: 0,
      uptime: this.stats.uptime,
    };
    this.activityLog = [];
  }

  /**
   * Health check
   */
  getHealth() {
    return {
      status: this.isRunning ? 'running' : 'stopped',
      socksPort: this.config.socksPort,
      controlPort: this.config.controlPort,
      uptime: this.getStats().uptime,
    };
  }
}

// Singleton instance
let torManagerInstance = null;

/**
 * Get or create TorManager singleton
 */
function getTorManager() {
  if (!torManagerInstance) {
    torManagerInstance = new TorManager();
  }
  return torManagerInstance;
}

module.exports = {
  TorManager,
  getTorManager,
};