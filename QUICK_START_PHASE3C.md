# Phase 3C - Tor Integration Quick Start ⚡

**Status**: ✅ COMPLETE | **Time**: 10 minutes to get running

---

## Prerequisites

Make sure Phase 3B is working first. You should be able to:
- ✅ Login to dashboard
- ✅ Submit sessions manually
- ✅ See balance updates

---

## Installation

### Option 1: With Real Tor (Recommended)

**macOS:**
```bash
brew install tor
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install tor
sudo systemctl start tor
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install tor
sudo systemctl start tor
```

**Windows:**
Download from [torproject.org/download](https://www.torproject.org/download/)

### Option 2: Simulation Mode (No Installation)

Use the built-in simulation mode - no Tor installation needed!

---

## Quick Test (5 minutes)

### 1. Start Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/frontend
npm run dev
```

### 2. Open App & Navigate to Tor Page

- Open http://localhost:3000
- Login with test credentials
- Click "🧅 Tor" in the navigation

### 3. Start Tor or Simulation

**Using Real Tor:**
- Make sure Tor is installed and running
- Click "🧅 Start Tor" button
- Wait for it to bootstrap (~30 seconds)

**Using Simulation:**
- Check the "🎮 Simulation Mode" checkbox
- Click "🎮 Start Simulation" button
- Instantly starts generating mock data

### 4. Start Monitoring

- Scroll down to "Auto-Submission Monitoring"
- Click "▶️ Start Monitoring"
- Watch sessions auto-submit as activity accumulates

### 5. Watch It Work

Observe in real-time:
- 📊 **Activity Statistics** - Data in/out, connections, circuits
- 🤖 **Auto-Submission** - Sessions accumulating and submitting
- 💰 **Credits** - Total earned credits displayed

---

## What You Should See

### Tor Control Panel
```
🟢 RUNNING (when started)
SOCKS Port: 9050
Control Port: 9051
Uptime: 5m 32s
```

### Activity Stats
```
📥 Data In: 2.5 MB
📤 Data Out: 1.8 MB
📊 Total: 4.3 MB
🔌 Connections: 12
🛣️ Circuits: 3
```

### Auto-Submission Progress
```
Accumulated Data: 50 KB / 100 KB
Time Accumulated: 25s / 30s
Sessions Submitted: 2
Total Credits Earned: 45.50
```

---

## Testing Scenarios

### Scenario 1: Simulate Activity (Fastest)

**Setup:**
1. Enable "Simulation Mode"
2. Start Simulation
3. Start Monitoring

**Expected Result:**
- Activity updates every 2 seconds
- Sessions auto-submit roughly every 30-60 seconds
- Credits accumulate

**Time to First Session**: ~30 seconds

### Scenario 2: Real Tor Activity

**Setup:**
1. Start real Tor
2. Start Monitoring
3. Use Tor:
   ```bash
   curl --socks5 localhost:9050 https://check.torproject.org
   ```

**Expected Result:**
- Stats update with real activity
- Sessions submit as thresholds are met
- Credits earned from real data

### Scenario 3: Mixed Testing

**Setup:**
1. Start real Tor
2. Start Monitoring
3. While monitoring, switch to simulation mode for faster testing

---

## Troubleshooting

### "Tor Bootstrap Timeout" Error

**Cause:** Tor not installed or not starting

**Solution:**
```bash
# Test Tor installation
which tor
tor --version

# Install if missing
brew install tor  # macOS
apt-get install tor  # Linux

# Use simulation mode instead
```

### No Sessions Appearing

**Check:**
1. Is Tor running? (Check "🟢 RUNNING" badge)
2. Is monitoring active? (Check "🟢 ACTIVE" badge)
3. Is data accumulating? (Check "Accumulated Data" value)

**Solution:**
- Switch to simulation mode if Tor has issues
- Check backend console for errors
- Restart monitoring

### Balance Not Updating

**Check:**
1. Sessions are being submitted (check auto-submission panel)
2. Backend is connected (check browser console for API errors)
3. MongoDB is running

**Solution:**
- Refresh page (Cmd+R)
- Check backend logs
- Verify MongoDB connection

### Port Already in Use

**Error:** "Address already in use 9050"

**Solution:**
```bash
# Find process using port
lsof -i :9050

# Kill the process
kill -9 <PID>

# Or use different ports via .env
TOR_SOCKS_PORT=9051
TOR_CONTROL_PORT=9052
```

---

## Configuration

### Auto-Submission Thresholds

Default settings for auto-submission:
- **Min Bytes**: 100 KB (batches accumulate until this)
- **Min Duration**: 30 seconds (minimum session time)
- **Max Duration**: 10 minutes (maximum session time)

Smaller thresholds = more frequent submissions but smaller credits per session
Larger thresholds = fewer submissions but larger credits per session

### Tor Configuration

Environment variables in `.env`:
```env
TOR_SOCKS_PORT=9050          # Default: 9050
TOR_CONTROL_PORT=9051        # Default: 9051
TOR_LOG_LEVEL=warn            # Default: warn
```

---

## API Endpoints (for reference)

All endpoints are on `/api/tor/`:

```
POST   /tor/start                     Start real Tor
POST   /tor/stop                      Stop Tor
GET    /tor/status                    Get Tor status
GET    /tor/activity?minutes=5        Get activity history
POST   /tor/monitoring/start          Start auto-submission
POST   /tor/monitoring/stop           Stop monitoring
GET    /tor/monitoring/stats          Get monitoring stats
GET    /tor/monitoring/sessions       Get submitted sessions
POST   /tor/simulate                  Start simulation mode
POST   /tor/simulate/stop             Stop simulation
POST   /tor/thresholds                Update batch thresholds
POST   /tor/reset                     Reset statistics
```

---

## Next Steps

After Phase 3C works:
1. **Phase 3D** - Persistent session storage (save to database)
2. **Phase 3E** - Real reward distribution
3. **Phase 4** - Chrome extension integration
4. **Phase 5** - Production deployment

---

## Common Commands

```bash
# View Tor status
curl http://localhost:3001/api/tor/status

# Get monitoring stats
curl http://localhost:3001/api/tor/monitoring/stats

# Stop everything
curl -X POST http://localhost:3001/api/tor/stop

# Start simulation
curl -X POST http://localhost:3001/api/tor/simulate

# Test real Tor connection
curl --socks5 localhost:9050 https://check.torproject.org
```

---

## Performance Tips

1. **Use Simulation Mode for Dev** - Faster iteration, no Tor needed
2. **Monitor System Resources** - Tor uses ~50-100 MB RAM
3. **Adjust Batch Thresholds** - Smaller for frequent sessions, larger for efficiency
4. **Check Backend Logs** - Always monitor console for errors

---

## Still Having Issues?

1. Check browser console (F12 → Console tab)
2. Check backend terminal for error messages
3. Check MongoDB connection status
4. Try simulation mode to isolate the issue
5. Restart everything: stop backend, stop frontend, close browser

**Everything working?** 🎉 Phase 3C is complete!

Next: Check `/tor` page regularly to see real earnings accumulating.