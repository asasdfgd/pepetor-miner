# 🍎 macOS 12 Setup Guide

Having issues on Mac 12? This guide will help you fix them!

---

## 🔍 Step 1: Run Diagnostics

First, let's see what's wrong:

```bash
bash scripts/diagnose.sh
```

This will check:
- ✅ Node.js installation
- ✅ npm installation
- ✅ Tor installation
- ✅ Port availability
- ✅ Project structure
- ✅ Environment files

**Keep this report handy** - it tells you exactly what needs fixing.

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Tor not found" or "Failed to start session"

**Cause**: Tor is not installed or not in your PATH

**Fix Option A: Install via Homebrew (Recommended)**

```bash
# First check if Homebrew is installed
brew --version

# If not, install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Tor
brew install tor

# Verify it works
tor --version
```

**Fix Option B: Use Our Mac 12 Installer Script**

```bash
bash scripts/install-tor-mac12.sh
```

This script will:
- ✅ Check for Homebrew (install if missing)
- ✅ Install Tor
- ✅ Add Tor to your PATH
- ✅ Verify installation

**Fix Option C: Manual PATH Setup**

If Tor is installed but not found:

```bash
# Check if tor exists in common locations
ls -la /usr/local/bin/tor          # Intel Mac
ls -la /opt/homebrew/bin/tor       # Apple Silicon

# Add to your shell config
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
tor --version
```

---

### Issue 2: "Port 3000/3001 already in use"

**Cause**: Another process is using the port

**Fix:**

```bash
# Find what's using port 3000
lsof -i :3000

# Find what's using port 3001
lsof -i :3001

# Kill the process(es)
kill -9 <PID>

# Try again
npm run dev
```

**Or use our helper:**

```bash
# Kill port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

### Issue 3: "npm modules not installed"

**Cause**: Dependencies not installed

**Fix:**

```bash
# One-command fix
npm run dev:setup

# Or manually
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

### Issue 4: ".env files missing"

**Cause**: Environment configuration not created

**Fix:**

```bash
# This is done automatically by setup script
bash scripts/setup-traffic-monitoring.sh

# Or manually
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## 🚀 Complete Mac 12 Setup (Fresh Start)

If you want to start completely fresh, follow this step-by-step:

### Step 1: Verify Node.js

```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
```

If you need to install or update Node.js:
- Visit: https://nodejs.org/
- Download LTS version
- Install it

### Step 2: Install Tor

```bash
# Check if already installed
tor --version

# If not, install
bash scripts/install-tor-mac12.sh

# Verify
tor --version
```

### Step 3: Verify Project

```bash
# Go to project root
cd /Users/josephpietravalle/PEPETOR-MINER

# Run diagnostics
bash scripts/diagnose.sh
```

**Fix any issues shown in red ❌**

### Step 4: Install Dependencies

```bash
npm run dev:setup
```

### Step 5: Setup Traffic Monitoring

```bash
bash scripts/setup-traffic-monitoring.sh
```

### Step 6: Start Development

```bash
npm run dev
```

### Step 7: Configure System Proxy

In another terminal or GUI:

1. Open **System Settings**
2. Go to **Network**
3. Select your connection (WiFi or Ethernet)
4. Click **Advanced...**
5. Go to **Proxies** tab
6. Check **SOCKS Proxy**
7. Set:
   - Server: `127.0.0.1`
   - Port: `9149`
8. Click **OK**

### Step 8: Open Frontend

1. Visit: http://localhost:3000
2. Login with your account
3. Click **Start Tor**
4. Wait 30-60 seconds for bootstrap
5. Click **Start Monitoring**
6. Load Chrome extension
7. Browse normally!

---

## 🐛 Troubleshooting Mac 12 Specific Issues

### "Tor starts but immediately closes"

**Try:**
```bash
# Restart Tor with more verbose output
tor --loglevel debug 2>&1 | head -20

# Check Tor data directory
rm -rf /tmp/pepetor-tor-data

# Try again
npm run dev
```

### "Permission denied" errors

**Try:**
```bash
# Fix permissions on Homebrew directory
sudo chown -R $(whoami) /usr/local/bin
sudo chown -R $(whoami) /opt/homebrew/bin
```

### "Command not found: npm" after shell restart

**Try:**
```bash
# This usually means Node.js PATH issue
which node
which npm

# If nothing, reinstall Node.js from https://nodejs.org/
# Then restart Terminal
```

### "Concurrently not installed"

**Try:**
```bash
npm install -D concurrently
npm run dev
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# Test 1: Check Node
node -e "console.log('✓ Node works')"

# Test 2: Check npm
npm -v

# Test 3: Check Tor
tor --version

# Test 4: Check project structure
ls -la backend frontend chrome-extension

# Test 5: Check dependencies
ls -la backend/node_modules | wc -l
ls -la frontend/node_modules | wc -l

# Test 6: Run diagnostics
bash scripts/diagnose.sh
```

All should show ✅ green checks.

---

## 📊 Expected Output When Running

When you run `npm run dev`, you should see:

```
[BACKEND] Server is running on http://localhost:3001 ✓
[BACKEND] [TOR] Starting Tor process...
[FRONTEND] VITE v5.0.8  ready in 234 ms ✓
[FRONTEND] ➜  Local:   http://localhost:3000/
[BACKEND] [TOR] Bootstrapped 10%...
[BACKEND] [TOR] Bootstrapped 50%...
[BACKEND] [TOR] Bootstrapped 100% - Ready
```

If you see errors:
- **"spawn tor ENOENT"** → Tor not installed, run `bash scripts/install-tor-mac12.sh`
- **"EADDRINUSE"** → Port in use, run `lsof -i :3000` to find and kill
- **"Cannot find module"** → npm modules missing, run `npm run dev:setup`

---

## 🆘 Still Stuck?

### Get More Debug Info

```bash
# Show all environment variables
env | grep -i tor

# Check what Tor is doing
cat /tmp/pepetor-tor-data/tor.log

# Test Tor directly
tor --version
tor --test-config

# Show Node version and paths
node --version
which node
which npm
```

### Manual Tor Test

```bash
# Try starting Tor manually
tor --SocksPort 9050 --ControlPort 9051 --ClientOnly 1

# Should see output like:
# Nov 01 12:34:56.000 [notice] Opening SOCKS listener on 127.0.0.1:9050
# Nov 01 12:34:56.000 [notice] Opening Control listener on 127.0.0.1:9051
# Nov 01 12:35:00.000 [notice] Bootstrapped 10%

# If it works, press Ctrl+C and try npm run dev again
```

### Create New Issue

If you're still stuck, you can:
1. Run: `bash scripts/diagnose.sh > /tmp/diag.txt`
2. Run: `cat /tmp/pepetor-tor-data/tor.log > /tmp/tor.txt`
3. Share those files

---

## 🎯 Quick Reference for Mac 12

| Issue | Quick Fix |
|-------|-----------|
| Tor not installed | `bash scripts/install-tor-mac12.sh` |
| Port in use | `lsof -i :3000` then `kill -9 <PID>` |
| npm modules missing | `npm run dev:setup` |
| Can't find npm | Restart Terminal or reinstall Node.js |
| Tor starts but crashes | `rm -rf /tmp/pepetor-tor-data` |
| Permission errors | `sudo chown -R $(whoami) /usr/local/bin` |

---

## 🎉 Success!

Once everything is working:

1. ✅ `npm run dev` starts both servers
2. ✅ http://localhost:3000 opens without errors
3. ✅ Backend shows Tor bootstrap messages
4. ✅ System proxy is set to 127.0.0.1:9149
5. ✅ You can click "Start Tor" without errors

**You're ready to start monitoring traffic!** 🚀

---

**Still need help?** Check the logs:
```bash
# Backend logs while running
cat /tmp/backend.log

# Frontend logs while running  
cat /tmp/frontend.log

# Tor logs
cat /tmp/pepetor-tor-data/tor.log
```