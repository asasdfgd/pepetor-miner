# 🔍 PEPETOR Traffic Monitoring Setup Guide

This guide explains how to set up real traffic monitoring for the PEPETOR Miner chrome extension.

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│ User Browser                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Browser Traffic                                          │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│  Manual System Proxy      │ (see setup instructions below)       │
│  Settings: 127.0.0.1:9149 │                                      │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PEPETOR Traffic Monitoring Proxy (Node.js)               │   │
│  │ Port: 9149 (SOCKS5)                                      │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────────┘
                              │ Real traffic capture
                              ↓
                    ┌─────────────────────┐
                    │ Tor Process         │
                    │ Port: 9050 (SOCKS5) │
                    │ Port: 9051 (Control)│
                    └─────────┬───────────┘
                              │
                              ↓
                    ┌──────────────────────┐
                    │ Tor Network          │
                    └──────────────────────┘
```

### Data Flow

1. **Browser Makes Request** → Traffic goes to proxy on port 9149
2. **Proxy Monitors Traffic** → Records bytes in/out, connection info
3. **Proxy Forwards to Tor** → Proxies request through Tor SOCKS5 (9050)
4. **Backend Tracks Activity** → AutoSubmissionService batches into sessions
5. **Sessions Auto-Submit** → Cryptographically signed sessions sent to backend
6. **Ledger Updated** → User earns credits

---

## Installation & Setup

### Step 1: Install Tor

**macOS:**
```bash
brew install tor
```

**Linux (Ubuntu/Debian):**
```bash
apt-get install tor
```

**Windows:**
- Download from https://www.torproject.org/download/
- Install to default location

**Verify Installation:**
```bash
tor --version
```

### Step 2: Start the Backend with Monitoring

```bash
cd backend
npm install
npm start
# Server will run on http://localhost:3001
```

The backend will:
- Start Tor process automatically when you call `/api/tor/start`
- Launch the traffic monitoring proxy on port 9149
- Begin tracking all traffic through the proxy

### Step 3: Configure Browser Proxy (Manual Setup)

Since Chrome extensions can't set system proxy directly, you have two options:

#### Option A: Manual System Proxy (Recommended for Testing)

**macOS:**
1. System Settings → Network → WiFi (or Ethernet)
2. Click "Advanced..."
3. Go to "Proxies" tab
4. Enable "SOCKS Proxy"
5. Server: `127.0.0.1`, Port: `9149`
6. Click OK

**Windows:**
1. Settings → Network & Internet → Proxy
2. Scroll to "Manual proxy setup"
3. Toggle "Use a proxy server" ON
4. Socks proxy: `127.0.0.1`
5. Port: `9149`
6. Save

**Linux (via environment):**
```bash
export all_proxy=socks5://127.0.0.1:9149
export ALL_PROXY=socks5://127.0.0.1:9149
```

#### Option B: Application-Level Proxy (For Production)

For production, you'd typically:
- Use browser automation (Puppeteer) to control proxy settings
- Create a background service that configures the proxy
- Use platform-specific APIs (Windows: WinHTTP, macOS: System Preferences)

### Step 4: Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `/Users/josephpietravalle/PEPETOR-MINER/chrome-extension`

### Step 5: Login and Start Monitoring

1. Click the PEPETOR extension icon
2. Click "Open App" (or navigate to http://localhost:3000)
3. Login with your credentials
4. In the web app dashboard, click "Start Tor"
5. Wait for Tor to bootstrap (30-60 seconds)
6. Click "Start Monitoring" 
7. The extension will start auto-submitting sessions as traffic flows

---

## How Traffic Monitoring Works

### TrafficMonitor Service (`trafficMonitor.js`)

The traffic monitor is a transparent SOCKS5 proxy that:

1. **Listens on port 9149** for incoming connections
2. **Tracks each connection** with:
   - Connection ID
   - Client IP address
   - Bytes in/out
   - Start time
   - Duration

3. **Forwards all traffic** to Tor SOCKS port (9050)
4. **Records activity** as connections close
5. **Emits events** for AutoSubmissionService to consume

### Key Methods

```javascript
// Start the monitoring proxy
await trafficMonitor.start()  // Listens on 9149

// Stop the proxy
await trafficMonitor.stop()

// Get statistics
trafficMonitor.getStats()
// Returns: { totalBytesIn, totalBytesOut, totalConnections, activeConnections }

// Listen for connection close events
trafficMonitor.on('connection-closed', (connData) => {
  // {
  //   connId: 42,
  //   bytesIn: 15234,
  //   bytesOut: 8234,
  //   totalBytes: 23468,
  //   duration: 45 (seconds)
  //   timestamp: 1234567890000
  // }
})
```

### TorManager Integration

When you click "Start Tor" in the web app:

1. **Backend spawns Tor process** via `TorManager.start()`
2. **Traffic monitor starts** automatically once Tor bootstraps
3. **TorManager listens** to traffic monitor events
4. **Activity is recorded** in `TorManager.stats`
5. **AutoSubmissionService consumes** the activity

```
Start Tor ──→ TorManager spawns process ──→ Tor bootstraps
                                           ↓
                                    Start TrafficMonitor
                                           ↓
                                    Listen for connections
                                           ↓
                                    Record activity
                                           ↓
                                    AutoSubmissionService batches
                                           ↓
                                    Auto-submit sessions
                                           ↓
                                    Update user ledger
```

---

## Testing the Setup

### Test 1: Verify Traffic Monitoring

```bash
# Check Tor status
curl http://localhost:3001/api/tor/status

# Should return: trafficMonitor info with proxyPort: 9149
```

### Test 2: Get Proxy Configuration

```bash
# Get the proxy config from the API
curl http://localhost:3001/api/tor/traffic-config

# Response:
# {
#   "config": {
#     "proxyServer": "socks5://127.0.0.1:9149",
#     "proxyPort": 9149,
#     "host": "127.0.0.1",
#     "bypassList": ["localhost", "127.0.0.1"],
#     "description": "PEPETOR traffic monitoring proxy"
#   }
# }
```

### Test 3: Generate Traffic

```bash
# Browse normally with proxy set to 9149
# Or use curl with the proxy:
curl --socks5 127.0.0.1:9149 https://example.com

# Check traffic stats
curl http://localhost:3001/api/tor/traffic-stats
```

### Test 4: Monitor Session Auto-Submission

```bash
# Get monitoring stats
curl http://localhost:3001/api/tor/monitoring/stats

# Should show accumulated bytes and auto-submitted sessions
```

---

## Troubleshooting

### Issue: Tor won't start

**Solution:**
```bash
# Make sure Tor is installed
brew install tor  # macOS
apt-get install tor  # Linux

# Check if it's already running
ps aux | grep tor

# Kill any existing Tor process
pkill -f "tor --SocksPort"
```

### Issue: Traffic monitor not starting

**Solution:**
1. Check port 9149 is free: `lsof -i :9149`
2. Check logs in backend console for errors
3. Verify Tor bootstrapped: `curl http://localhost:3001/api/tor/status`

### Issue: Proxy not working

**Solution:**
1. Verify system proxy settings point to 9149
2. Check if traffic monitor is running: `lsof -i :9149`
3. Try connecting directly: `curl --socks5 127.0.0.1:9149 https://www.google.com`

### Issue: No traffic being recorded

**Solution:**
1. Make sure proxy system settings are correct
2. Try making a request through proxy
3. Check `curl --socks5 127.0.0.1:9149 https://example.com`
4. Verify stats endpoint: `curl http://localhost:3001/api/tor/traffic-stats`

---

## API Endpoints

### Traffic Monitoring APIs

```
GET  /api/tor/status
     Returns: Tor status, stats, traffic monitor info

GET  /api/tor/traffic-config
     Returns: Proxy configuration for browser setup

GET  /api/tor/traffic-stats
     Returns: Real-time traffic statistics
     {
       "stats": {
         "isRunning": true,
         "totalBytesIn": 1048576,
         "totalBytesOut": 524288,
         "totalConnections": 42,
         "activeConnections": 3
       }
     }

POST /api/tor/start
     Starts Tor process and traffic monitor

POST /api/tor/stop
     Stops Tor and traffic monitor

POST /api/tor/monitoring/start
     Starts auto-submission of sessions

POST /api/tor/monitoring/stop
     Stops auto-submission
```

---

## Performance Notes

### Proxy Overhead
- Traffic monitoring adds ~5-10% CPU overhead per connection
- Memory usage: ~1-2MB per active connection
- Maximum recommended: 100+ concurrent connections

### Session Batching
- Default: 100KB minimum data, 30 seconds minimum
- Can be adjusted via `/api/tor/thresholds`
- Sessions auto-submit when:
  - Data ≥ 100KB AND duration ≥ 30 seconds, OR
  - Duration ≥ 10 minutes (max)

---

## Production Deployment

For production, consider:

1. **Separate Proxy Server**
   - Run traffic monitor on separate machine
   - Better isolation and scalability

2. **TLS Encryption**
   - Use certificate for proxy communication
   - Validate client certificates

3. **Load Balancing**
   - Multiple proxy instances
   - Distribute traffic across servers

4. **Metrics & Monitoring**
   - Export Prometheus metrics
   - Track proxy health and performance

5. **Rate Limiting**
   - Per-user bandwidth caps
   - Prevent abuse

6. **Database Persistence**
   - Store all connections/sessions
   - Enable analytics and auditing

---

## Next Steps

1. ✅ Set up system proxy to port 9149
2. ✅ Start Tor via the web app dashboard
3. ✅ Start monitoring via the dashboard
4. ✅ Browse normally - traffic will be captured
5. ✅ Check extension for earned credits
6. ✅ View auto-submitted sessions in dashboard

Congratulations! You're now running real traffic monitoring! 🎉