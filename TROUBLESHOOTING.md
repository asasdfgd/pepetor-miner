# 🆘 Troubleshooting Guide

Having issues? Start here!

---

## 🚀 Quick Diagnostics (2 minutes)

### Step 1: Run Diagnostic Script

```bash
bash scripts/diagnose.sh
```

This will show you exactly what's wrong. **Note the ❌ red items.**

### Step 2: Run Backend Test

```bash
# First, start the backend in one terminal
npm run dev:backend

# Then in another terminal
bash scripts/test-backend.sh
```

This will check if the backend can start Tor.

---

## ❌ Common Error Messages & Fixes

### Error: "Failed to start session"

**Cause**: Backend can't start Tor

**Solution**:
```bash
# Check if Tor is installed
tor --version

# If not found, install it
bash scripts/install-tor-mac12.sh

# Then try again
npm run dev
```

---

### Error: "spawn tor ENOENT"

**Cause**: Tor binary not found or not in PATH

**Solution**:
```bash
# Option 1: Install Tor
bash scripts/install-tor-mac12.sh

# Option 2: Manual PATH fix (if Tor exists at /usr/local/bin/tor)
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
tor --version

# Option 3: Verify Tor exists
which tor
ls -la /usr/local/bin/tor
ls -la /opt/homebrew/bin/tor
```

---

### Error: "EADDRINUSE: address already in use :::3000"

**Cause**: Port 3000 is already in use

**Solution**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Try again
npm run dev
```

---

### Error: "EADDRINUSE: address already in use :::3001"

**Cause**: Port 3001 is already in use

**Solution**:
```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Try again
npm run dev
```

---

### Error: "Cannot find module 'concurrently'"

**Cause**: Dependencies not installed

**Solution**:
```bash
npm run dev:setup
npm run dev
```

---

### Error: "Cannot find module" (in backend or frontend)

**Cause**: Dependencies not installed in that directory

**Solution**:
```bash
# Install all
npm run dev:setup

# Or specific directory
cd backend && npm install
cd ../frontend && npm install
```

---

### Error: "Tor bootstrap timeout"

**Cause**: Tor is taking too long to start or won't start

**Solution**:
```bash
# Option 1: Try restarting
npm run dev
# Press Ctrl+C
# Wait 5 seconds
# npm run dev again

# Option 2: Clear Tor data and try again
rm -rf /tmp/pepetor-tor-data
npm run dev

# Option 3: Test Tor directly
tor --version
tor --test-config

# If Tor itself is broken, reinstall
bash scripts/install-tor-mac12.sh
```

---

### Error: ".env file missing"

**Cause**: Environment files not created

**Solution**:
```bash
# Run setup script (does this automatically)
bash scripts/setup-traffic-monitoring.sh

# Or manually
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

### Error: "command not found: npm" (after restart)

**Cause**: Node.js not in PATH or not installed

**Solution**:
```bash
# Check if installed
node --version
npm --version

# If not found, install from https://nodejs.org/

# If installed but not found, add to PATH
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Restart Terminal and try again
```

---

## 🔍 Detailed Troubleshooting

### "Failed to start session" - Deep Dive

The error usually means one of these:

**1. Tor is not installed**
```bash
# Check
tor --version

# Fix
bash scripts/install-tor-mac12.sh
```

**2. Tor is installed but not in PATH**
```bash
# Check
which tor

# Fix
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
tor --version
```

**3. Tor starts but exits immediately**
```bash
# Check Tor logs
cat /tmp/pepetor-tor-data/tor.log

# Clear and retry
rm -rf /tmp/pepetor-tor-data
npm run dev

# Test Tor directly
tor --loglevel info
```

**4. Port 9050 or 9051 in use**
```bash
# Check
lsof -i :9050
lsof -i :9051

# Fix
kill -9 <PID>
npm run dev
```

---

### Testing Each Component

**Test Node.js**:
```bash
node -e "console.log('✓ Node works: ' + process.version)"
npm -v
```

**Test Tor**:
```bash
tor --version
tor --test-config
```

**Test Backend**:
```bash
cd backend && npm run dev
# In another terminal
curl http://localhost:3001/api/health
```

**Test Frontend**:
```bash
cd frontend && npm run dev
# Open http://localhost:3000 in browser
```

**Test Both Together**:
```bash
npm run dev
# Should see both BACKEND and FRONTEND lines
```

---

## 📋 Fresh Start Checklist

If you're completely stuck, try this fresh start:

### Step 1: Kill Everything

```bash
# Kill all Node processes
killall node

# Kill any Tor processes
killall tor

# Wait a moment
sleep 2
```

### Step 2: Clear Cache/Data

```bash
# Clear npm cache
npm cache clean --force

# Clear Tor data
rm -rf /tmp/pepetor-tor-data

# Optional: Clear node_modules (last resort)
# rm -rf backend/node_modules
# rm -rf frontend/node_modules
# rm -rf node_modules
```

### Step 3: Verify Installation

```bash
# Check versions
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
tor --version     # Should work

# If any fail, install or fix PATH
bash scripts/install-tor-mac12.sh
```

### Step 4: Reinstall Dependencies

```bash
npm run dev:setup
```

### Step 5: Start Fresh

```bash
npm run dev
```

---

## 🧪 Testing Commands

**Quick health check**:
```bash
bash scripts/diagnose.sh
```

**Test backend while running**:
```bash
bash scripts/test-backend.sh
```

**Test specific port**:
```bash
# Is port 3000 free?
lsof -i :3000 || echo "Port 3000 is free ✓"

# Is port 3001 free?
lsof -i :3001 || echo "Port 3001 is free ✓"

# Is port 9149 (proxy) free?
lsof -i :9149 || echo "Port 9149 is free ✓"

# Is port 9050 (Tor) free?
lsof -i :9050 || echo "Port 9050 is free ✓"
```

**Check process logs**:
```bash
# Backend logs (if using dev.sh)
tail -f /tmp/backend.log

# Frontend logs (if using dev.sh)
tail -f /tmp/frontend.log

# Tor logs
cat /tmp/pepetor-tor-data/tor.log

# System logs (last 50 lines)
tail -50 /var/log/system.log
```

---

## 🎯 Platform-Specific Issues

### macOS Specific

**Issue: "permission denied" when installing Tor**
```bash
# Fix ownership
sudo chown -R $(whoami) /usr/local/bin
sudo chown -R $(whoami) /opt/homebrew/bin
```

**Issue: M1/M2 Mac compatibility**
```bash
# Homebrew should auto-detect, but if issues:
brew install tor --universal

# Or use native
arch -arm64 brew install tor
```

**Issue: Tor not found after Homebrew install**
```bash
# Intel Mac
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc

# Apple Silicon Mac
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc

# Both
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc
```

---

## 🚨 Critical Errors

### Backend Won't Start

```bash
# Check if Node is installed
node --version

# Check backend dependencies
ls -la backend/node_modules | wc -l  # Should be > 0

# Check for syntax errors
node backend/src/index.js

# Check port
lsof -i :3001

# Full debug
cd backend && npm run dev -- --inspect
```

### Frontend Won't Start

```bash
# Check if Node is installed
node --version

# Check frontend dependencies
ls -la frontend/node_modules | wc -l  # Should be > 0

# Check for build errors
cd frontend && npm run build

# Check port
lsof -i :3000

# Full debug
cd frontend && npm run dev -- --debug
```

### Tor Won't Start

```bash
# Check if Tor is installed
tor --version

# Check if Tor binary works
tor --test-config

# Start Tor manually with debug
tor --loglevel notice

# Check what error it gives
tor --version 2>&1
```

---

## 📞 Getting Help

Before asking for help, gather this info:

```bash
# System info
uname -a
echo $PATH

# Node info
node --version && npm --version

# Tor info
tor --version

# Run diagnostics
bash scripts/diagnose.sh > /tmp/diagnose.txt

# Get backend test results
bash scripts/test-backend.sh > /tmp/test.txt

# Get Tor logs
cat /tmp/pepetor-tor-data/tor.log > /tmp/tor.log

# Package this up
echo "Ready to share /tmp/diagnose.txt, /tmp/test.txt, /tmp/tor.log"
```

Then share those files and the error message you're seeing.

---

## ✅ How to Know It's Fixed

When everything is working, you should see:

```
✓ npm run dev starts without errors
✓ Backend says: "Listening on http://localhost:3001"
✓ Frontend says: "ready in 234 ms"
✓ No port already in use errors
✓ bash scripts/diagnose.sh shows all green ✓
✓ bash scripts/test-backend.sh shows all tests passing
✓ http://localhost:3000 opens in browser
✓ "Start Tor" button works without error
```

If you see all of these, you're good to go! 🎉

---

**Last Updated**: November 2024
**For Mac OS 12+**