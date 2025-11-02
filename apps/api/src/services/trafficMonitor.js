const net = require('net');
const { EventEmitter } = require('events');

/**
 * TrafficMonitor - Monitors actual SOCKS5 traffic to Tor
 * 
 * This sits between the browser and Tor SOCKS port (9050)
 * and tracks all bytes flowing through connections
 */
class TrafficMonitor extends EventEmitter {
  constructor(torSocksPort = 9050) {
    super();
    this.torSocksPort = torSocksPort;
    this.proxyServer = null;
    this.isRunning = false;
    this.connections = new Map();
    this.stats = {
      totalBytesIn: 0,
      totalBytesOut: 0,
      totalConnections: 0,
      activeConnections: 0,
    };
    this.connectionId = 0;
  }

  /**
   * Start monitoring - creates a transparent proxy
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Use a random high port for the monitoring proxy
        const proxyPort = 9149;
        
        console.log('[TrafficMonitor] Starting proxy on port', proxyPort);
        console.log('[TrafficMonitor] Forwarding to Tor SOCKS on port', this.torSocksPort);

        this.proxyServer = net.createServer((clientSocket) => {
          this.handleNewConnection(clientSocket);
        });

        this.proxyServer.listen(proxyPort, '127.0.0.1', () => {
          this.isRunning = true;
          console.log('[TrafficMonitor] Proxy listening on port', proxyPort);
          resolve({
            success: true,
            proxyPort,
            torPort: this.torSocksPort,
          });
        });

        this.proxyServer.on('error', (err) => {
          console.error('[TrafficMonitor] Server error:', err);
          reject(err);
        });

      } catch (error) {
        console.error('[TrafficMonitor] Failed to start:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop monitoring
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.proxyServer) {
        // Close all connections
        for (const [id, connData] of this.connections) {
          connData.clientSocket.destroy();
          if (connData.torSocket) connData.torSocket.destroy();
        }

        this.proxyServer.close(() => {
          this.isRunning = false;
          console.log('[TrafficMonitor] Proxy stopped');
          resolve({ success: true });
        });
      } else {
        resolve({ success: true });
      }
    });
  }

  /**
   * Handle new client connection
   */
  handleNewConnection(clientSocket) {
    const connId = ++this.connectionId;
    const connData = {
      id: connId,
      clientSocket,
      torSocket: null,
      bytesIn: 0,
      bytesOut: 0,
      startTime: Date.now(),
      clientIp: clientSocket.remoteAddress,
    };

    this.connections.set(connId, connData);
    this.stats.totalConnections++;
    this.stats.activeConnections = this.connections.size;

    console.log(`[TrafficMonitor] New connection ${connId} from ${clientSocket.remoteAddress}`);

    // Connect to Tor SOCKS port
    const torSocket = net.createConnection({
      host: '127.0.0.1',
      port: this.torSocksPort,
    });

    connData.torSocket = torSocket;

    // Track bytes from client to Tor
    clientSocket.on('data', (data) => {
      connData.bytesOut += data.length;
      this.stats.totalBytesOut += data.length;
      torSocket.write(data);
    });

    // Track bytes from Tor to client
    torSocket.on('data', (data) => {
      connData.bytesIn += data.length;
      this.stats.totalBytesIn += data.length;
      clientSocket.write(data);
    });

    // Handle connection close/error
    const cleanupConnection = () => {
      this.connections.delete(connId);
      this.stats.activeConnections = this.connections.size;

      const duration = Math.floor((Date.now() - connData.startTime) / 1000);
      const totalBytes = connData.bytesIn + connData.bytesOut;

      console.log(`[TrafficMonitor] Connection ${connId} closed:`, {
        duration: `${duration}s`,
        bytesIn: connData.bytesIn,
        bytesOut: connData.bytesOut,
        totalBytes,
      });

      // Emit activity for auto-submission
      if (totalBytes > 0) {
        this.emit('connection-closed', {
          connId,
          bytesIn: connData.bytesIn,
          bytesOut: connData.bytesOut,
          totalBytes,
          duration,
          timestamp: connData.startTime,
        });
      }
    };

    clientSocket.on('end', cleanupConnection);
    clientSocket.on('error', (err) => {
      console.error(`[TrafficMonitor] Client socket error ${connId}:`, err.message);
      cleanupConnection();
    });

    torSocket.on('end', () => {
      clientSocket.end();
      cleanupConnection();
    });

    torSocket.on('error', (err) => {
      console.error(`[TrafficMonitor] Tor socket error ${connId}:`, err.message);
      clientSocket.end();
      cleanupConnection();
    });
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      ...this.stats,
      activeConnections: this.connections.size,
    };
  }

  /**
   * Get detailed connection info
   */
  getConnections() {
    const connections = [];
    for (const [id, connData] of this.connections) {
      connections.push({
        id: connData.id,
        clientIp: connData.clientIp,
        bytesIn: connData.bytesIn,
        bytesOut: connData.bytesOut,
        uptime: Math.floor((Date.now() - connData.startTime) / 1000),
        startTime: new Date(connData.startTime).toISOString(),
      });
    }
    return connections;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalBytesIn: 0,
      totalBytesOut: 0,
      totalConnections: 0,
      activeConnections: this.connections.size,
    };
  }
}

// Singleton
let monitorInstance = null;

function getTrafficMonitor(torSocksPort = 9050) {
  if (!monitorInstance) {
    monitorInstance = new TrafficMonitor(torSocksPort);
  }
  return monitorInstance;
}

module.exports = {
  TrafficMonitor,
  getTrafficMonitor,
};