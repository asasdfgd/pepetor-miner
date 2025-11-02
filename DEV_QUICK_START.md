# 🚀 Development Quick Start Guide

Run both backend and frontend with a single command!

---

## ⚡ Quickest Way (Recommended)

### Option 1: npm Command (Colorized Output)

```bash
# From the root directory
npm run dev
```

✨ **Features:**
- ✅ Runs backend + frontend simultaneously
- ✅ Colored output (Backend in blue, Frontend in magenta)
- ✅ Auto-kills both when you press Ctrl+C
- ✅ Shows both server URLs and ports
- ✅ Real-time logs in same terminal

**Output:**
```
🚀 PEPETOR-MINER Development Environment
==========================================

✅ Node.js version: v18.x.x
✅ npm version: 9.x.x

📦 Starting Backend Server...
⚛️  Starting Frontend Server...

==========================================
✨ Both servers are running!

✅ Backend running (BLUE):  http://localhost:3001
✅ Frontend running (MAGENTA): http://localhost:3000

Press Ctrl+C to stop both servers
```

---

## 🔧 Alternative Methods

### Option 2: Shell Script (Enhanced with Logs)

```bash
# Make it executable (first time only)
chmod +x scripts/dev.sh

# Run it
./scripts/dev.sh
```

✨ **Features:**
- ✅ Runs backend + frontend simultaneously
- ✅ Saves logs to `/tmp/backend.log` and `/tmp/frontend.log`
- ✅ Shows PIDs for both processes
- ✅ Tail log files in separate windows while running
- ✅ Clean shutdown on Ctrl+C

**View logs while running:**
```bash
# In another terminal
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

---

### Option 3: Minimal Shell Script

```bash
chmod +x scripts/dev-simple.sh
./scripts/dev-simple.sh
```

✨ **Features:**
- ✅ Simplest option (50 lines)
- ✅ Ultra-lightweight
- ✅ Shows basic URLs
- ✅ Ctrl+C stops both

---

## 📋 Setup (One-Time)

Install dependencies for all components:

```bash
# From the root directory
npm run dev:setup
```

Or manually:
```bash
npm install                 # Install root dependencies (concurrently)
cd backend && npm install   # Install backend dependencies
cd frontend && npm install  # Install frontend dependencies
```

---

## 🎯 Complete Workflow

### Step 1: One-Time Setup
```bash
cd /Users/josephpietravalle/PEPETOR-MINER
npm run dev:setup
bash scripts/setup-traffic-monitoring.sh
```

### Step 2: Start Development
```bash
npm run dev
```

### Step 3: Configure Proxy (macOS)
- System Settings → Network → Proxies
- SOCKS Proxy: `127.0.0.1:9149`

### Step 4: Test
- Open http://localhost:3000
- Click "Start Tor"
- Load Chrome extension
- Browse normally ✨

---

## 🔥 Pro Tips

### Run Individual Services

```bash
# Just backend
npm run dev:backend

# Just frontend
npm run dev:frontend

# Just start production backend
npm start
```

### Linting & Building

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Build just frontend
npm run build:frontend
```

### Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend
```

---

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Then run npm run dev again
```

### "Port 3001 already in use"
```bash
# Find and kill backend
lsof -i :3001
kill -9 <PID>
```

### "concurrently not found"
```bash
# Install it
npm install
```

### Logs are cut off
Run the shell script instead to get full logs:
```bash
./scripts/dev.sh
```

Then in another terminal:
```bash
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

---

## 📊 Comparison Table

| Feature | `npm run dev` | `./scripts/dev.sh` | `./scripts/dev-simple.sh` |
|---------|--------------|-------------------|---------------------------|
| Setup | Install once | Already ready | Already ready |
| Output Colors | ✅ Yes | ✅ Yes (with setup) | ⚠️ No |
| Log Files | ❌ No | ✅ /tmp/*.log | ❌ No |
| Ctrl+C Cleanup | ✅ Clean | ✅ Clean | ✅ Clean |
| Command Length | 13 chars | 17 chars | 20 chars |
| Requires npm | ✅ Yes | ❌ No | ❌ No |
| Recommended | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## 🎓 What Happens Behind the Scenes

When you run `npm run dev`:

1. **Root package.json** calls `concurrently`
2. **concurrently** simultaneously runs:
   - `cd backend && npm run dev` (uses `node --watch`)
   - `cd frontend && npm run dev` (uses Vite dev server)
3. **Both output** to your terminal with:
   - Blue prefix: Backend logs
   - Magenta prefix: Frontend logs
4. **Press Ctrl+C** → concurrently catches the signal and kills both child processes
5. **Both exit** cleanly without orphaned processes

---

## 🚀 Next Steps After Starting

```
http://localhost:3000 ← Open this in browser
        ↓
    React App
        ↓
    [Start Tor] ← Click this
        ↓
    Wait 30-60s
        ↓
    [Start Monitoring] ← Click this
        ↓
    Load Chrome Extension
        ↓
    Browse Normally ← Traffic captured automatically!
```

---

## 📞 Need Help?

1. **Check logs:** `tail -f /tmp/backend.log` (if using dev.sh)
2. **Verify ports:** `lsof -i :3000` and `lsof -i :3001`
3. **Check traffic monitor:** `curl http://localhost:3001/api/tor/status`
4. **Read:** `TRAFFIC_MONITORING_README.md`

---

**You're all set!** 🎉

Run `npm run dev` from the root and both services start together. No more tab switching!