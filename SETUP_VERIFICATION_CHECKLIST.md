# ✅ Setup Verification Checklist

Use this checklist to verify your PEPETOR-MINER installation is complete and working.

---

## 📋 Prerequisites Checklist

- [ ] **Node.js installed** - Run: `node --version` (should be v18+)
- [ ] **npm installed** - Run: `npm --version` (should be v9+)
- [ ] **Git installed** - Run: `git --version`
- [ ] **MongoDB account created** (MongoDB Atlas)

---

## 📥 Repository Setup Checklist

- [ ] **Repository cloned** - Run: `git clone` command
- [ ] **Navigated to project** - Run: `cd PEPETOR-MINER`
- [ ] **Verified project folder** - Run: `ls` (should see backend, frontend, chrome-extension folders)

---

## ⚙️ Configuration Checklist

### Backend Configuration

- [ ] **`backend/.env` file exists** - Run: `ls backend/.env`
- [ ] **`backend/.env` has MONGODB_URI** - Run: `grep MONGODB_URI backend/.env`
- [ ] **MONGODB_URI is valid** - Check format: `mongodb+srv://username:password@...`
- [ ] **MONGODB_URI username/password correct** - Verify in MongoDB Atlas
- [ ] **PORT is set to 3001** - Run: `grep PORT backend/.env`
- [ ] **CORS_ORIGIN is correct** - Run: `grep CORS_ORIGIN backend/.env`
- [ ] **JWT secrets are set** - Run: `grep JWT backend/.env`

### Frontend Configuration

- [ ] **`frontend/.env` file exists** - Run: `ls frontend/.env`
- [ ] **`frontend/.env` has VITE_API_BASE_URL** - Run: `grep VITE_API_BASE_URL frontend/.env`
- [ ] **VITE_API_BASE_URL is correct** - Should be `http://localhost:3001/api`

---

## 📦 Dependency Installation Checklist

- [ ] **Root dependencies installed** - Run: `npm run dev:setup`
- [ ] **`node_modules` exists at root** - Run: `ls node_modules | head`
- [ ] **Backend dependencies installed** - Run: `ls backend/node_modules | head`
- [ ] **Frontend dependencies installed** - Run: `ls frontend/node_modules | head`
- [ ] **No installation errors** - Check previous terminal output (should say "added XXX packages")

---

## 🗄️ Database Checklist

- [ ] **MongoDB Atlas cluster is running** - Check at https://www.mongodb.com/cloud/atlas
- [ ] **MongoDB connection string is accessible** - Try connecting with MongoDB Compass or mongosh
- [ ] **IP is whitelisted in MongoDB Atlas**
  - Go to Network Access
  - Verify your current IP is in the list
  - Or allow 0.0.0.0/0 for testing
- [ ] **Database `pepetor-miner` exists** (will be created automatically)

---

## 🧪 Connection Tests

### Test Backend Connection

```bash
# This should return a JSON response with status "Server is running"
curl http://localhost:3001/api/health
```

- [ ] **Backend responds to health check**

### Test MongoDB Connection

```bash
# From within the project directory, run backend tests
npm run test:backend
```

- [ ] **MongoDB connection test passes**
- [ ] **No "connection refused" errors**
- [ ] **No "authentication failed" errors**

### Test API Endpoints

```bash
# Get all users
curl http://localhost:3001/api/users

# Should return a JSON array (may be empty if no users yet)
```

- [ ] **API responds with valid JSON**

---

## 🚀 Server Startup Checklist

### Start Servers

```bash
npm run dev
```

- [ ] **Command runs without errors**
- [ ] **Backend starts** (blue output in terminal)
- [ ] **Frontend starts** (magenta output in terminal)
- [ ] **Backend shows: "Server is running on port 3001"**
- [ ] **Frontend shows: "http://localhost:3000"**

---

## 🌐 Frontend Access Checklist

- [ ] **http://localhost:3000 loads in browser**
- [ ] **Page is not blank** (shows application UI)
- [ ] **No "Cannot GET /" error**
- [ ] **Browser DevTools Console has no errors** (Press F12)
- [ ] **No "Failed to fetch" errors in console**

---

## 🔗 Connection Between Servers Checklist

- [ ] **Frontend successfully calls backend API**
  - Check browser DevTools → Network tab
  - Should see requests to `localhost:3001/api/...`
- [ ] **No CORS errors** in browser console
- [ ] **Backend receives requests** from frontend
  - Check terminal where `npm run dev` is running
  - Should see log entries like: `GET /api/...`

---

## 🛑 Shutdown Checklist

```bash
# In terminal, press Ctrl+C
```

- [ ] **Both servers stop cleanly**
- [ ] **No error messages on shutdown**
- [ ] **Terminal returns to prompt**
- [ ] **Ports are released** (can start again immediately)

---

## ✅ Full Development Environment Checklist

- [ ] All prerequisites installed
- [ ] Repository cloned and setup complete
- [ ] Configuration files created with correct values
- [ ] All dependencies installed
- [ ] Database connection works
- [ ] Backend server starts and responds
- [ ] Frontend server starts and loads
- [ ] Frontend and backend can communicate
- [ ] No errors in browser console
- [ ] Servers shut down cleanly

---

## 🎉 Success Criteria

**You're ready to develop if:**

✅ `npm run dev` starts both servers without errors
✅ `http://localhost:3000` loads without errors
✅ Browser DevTools Console is clean (no red errors)
✅ `curl http://localhost:3001/api/health` returns JSON response
✅ Both servers stop cleanly with Ctrl+C

---

## 🐛 If Something Fails

### Check These First

1. **Are all prerequisites installed?**
   ```bash
   node --version
   npm --version
   git --version
   ```

2. **Does `npm run dev:setup` complete without errors?**
   ```bash
   npm run dev:setup
   ```

3. **Can you connect to MongoDB?**
   ```bash
   npm run test:backend
   ```

4. **Are ports 3000 and 3001 available?**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

5. **Is backend responding?**
   ```bash
   curl http://localhost:3001/api/health
   ```

---

## 📚 Getting Help

**If verification fails:**

1. Read the error message carefully
2. Check **[GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md)** - Troubleshooting section
3. Verify your configuration in `.env` files
4. Try reinstalling: `npm run dev:setup`
5. Check the specific guide:
   - Backend issues → See backend/README.md
   - Frontend issues → See frontend/README.md
   - Database issues → See GITHUB_SETUP_GUIDE.md (MongoDB section)

---

## 📝 Verification Log

**Date:** __________________

**Verified by:** __________________

**Results:**
- [ ] All checks passed ✅
- [ ] Some checks failed ⚠️ (list which ones)

**Notes:**
_________________________________________

_________________________________________

_________________________________________

---

**Print this page and check off each item as you complete it!**

**All boxes checked? You're ready to code! 🚀**