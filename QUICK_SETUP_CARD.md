# ⚡ PEPETOR-MINER Quick Setup Card

**Print this or keep it handy!**

---

## 📋 Prerequisites (One-Time)

```bash
# 1. Install Node.js from https://nodejs.org/ (LTS version)
# 2. Install Git from https://git-scm.com/
# 3. Create MongoDB Atlas account (free) - get connection string
```

---

## 🚀 First Time Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/your-username/PEPETOR-MINER.git
cd PEPETOR-MINER

# 2. Create backend/.env file with your MongoDB connection:
nano backend/.env
```

**Paste into backend/.env:**
```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/pepetor-miner?retryWrites=true&w=majority
JWT_SECRET=dev_secret_key
JWT_REFRESH_SECRET=dev_refresh_secret
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

```bash
# 3. Create frontend/.env file
nano frontend/.env
```

**Paste into frontend/.env:**
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENV=development
VITE_APP_NAME=PEPETOR-MINER
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

```bash
# 4. Install all dependencies (takes 2-5 minutes)
npm run dev:setup
```

✅ **First-time setup complete!**

---

## 🎯 Every Time You Want to Develop

```bash
# Navigate to project (if not already there)
cd PEPETOR-MINER

# Start both servers in one command
npm run dev
```

**You'll see:**
```
BACKEND   running on http://localhost:3001
FRONTEND  running on http://localhost:3000
```

**Open in browser:** `http://localhost:3000`

**Stop servers:** Press `Ctrl+C`

---

## 🛠️ Useful Commands

```bash
npm run dev              # Start both servers
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build for production
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix code issues
npm test                 # Run tests
npm run dev:setup        # Reinstall all dependencies
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Port 3000 in use" | `lsof -i :3000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| "Port 3001 in use" | `lsof -i :3001 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| "MongoDB connection error" | Check username/password in `backend/.env` |
| "concurrently not found" | Run `npm run dev:setup` |
| "Blank page at :3000" | Check backend is running: `curl http://localhost:3001/api/health` |

---

## 📁 Project Files

- `backend/` - Express.js API server
- `frontend/` - React web app
- `chrome-extension/` - Browser extension
- `backend/.env` - Backend configuration (you created this)
- `frontend/.env` - Frontend configuration (you created this)

---

## ✅ Verification

**Verify backend is running:**
```bash
curl http://localhost:3001/api/health
```
Should return: `{"success":true,"status":"Server is running"}`

**Verify frontend is running:**
```bash
curl http://localhost:3000
```
Should return HTML (React app)

---

## 📞 Common Issues

### MongoDB Not Connecting
1. Check `backend/.env` - is username/password correct?
2. Check MongoDB Atlas - is cluster running?
3. Check Network Access in MongoDB Atlas - is your IP whitelisted?

### Frontend Shows Blank Page
1. Open browser DevTools: `F12` or `Ctrl+Shift+I`
2. Check Console tab for errors
3. Verify `VITE_API_BASE_URL` in `frontend/.env`
4. Verify backend is running: `curl http://localhost:3001/api/health`

### Dependencies Won't Install
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm run dev:setup
```

---

## 🚀 Next Steps

1. ✅ Complete setup above
2. ✅ Run `npm run dev`
3. ✅ Open `http://localhost:3000`
4. ✅ Start coding!

---

**For full setup guide:** See `GITHUB_SETUP_GUIDE.md`

**For development guide:** See `DEV_QUICK_START.md`