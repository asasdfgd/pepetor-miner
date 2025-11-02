# 📖 Complete Setup Guide: GitHub to Running PEPETOR-MINER

This guide walks you through downloading and running PEPETOR-MINER from GitHub, step-by-step.

---

## 📋 Prerequisites (Before You Start)

Before setting up PEPETOR-MINER, install these on your computer:

### 1. **Node.js & npm**

**Why?** Node.js is required to run the backend and frontend.

**Mac:**
```bash
brew install node
```

**Windows:**
- Download from https://nodejs.org/
- Install the LTS version

**Linux:**
```bash
sudo apt update && sudo apt install nodejs npm
```

**Verify Installation:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

### 2. **Git**

**Why?** Needed to clone the repository from GitHub.

**Mac:**
```bash
brew install git
```

**Windows:**
- Download from https://git-scm.com/download/win

**Linux:**
```bash
sudo apt install git
```

**Verify Installation:**
```bash
git --version
```

---

### 3. **MongoDB Connection**

**Why?** The backend stores user data in MongoDB.

**Option A: Cloud MongoDB (Recommended - No Installation Needed)**
- Sign up at https://www.mongodb.com/cloud/atlas (FREE)
- Create a cluster (takes 2-3 minutes)
- Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
- No local installation needed!

**Option B: Local MongoDB (Advanced)**
**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Windows/Linux:**
- Download from https://www.mongodb.com/try/download/community

---

## 🚀 Step-by-Step Setup

### **Step 1: Open Terminal/Command Prompt**

**Mac/Linux:**
- Open Applications → Utilities → Terminal

**Windows:**
- Open Command Prompt or PowerShell

---

### **Step 2: Choose a Folder for Your Project**

**Recommended:** Create a `projects` folder in your home directory.

```bash
# Mac/Linux
mkdir ~/projects
cd ~/projects

# Windows (PowerShell)
md projects
cd projects
```

---

### **Step 3: Clone the Repository from GitHub**

This downloads all the code to your computer.

```bash
git clone https://github.com/your-username/PEPETOR-MINER.git
```

Replace `your-username` with the actual GitHub username.

**What just happened:**
- ✅ Downloaded all code files
- ✅ Created a folder called `PEPETOR-MINER`
- ✅ All project files are now on your computer

---

### **Step 4: Navigate Into the Project**

```bash
cd PEPETOR-MINER
```

You should now be in the project root directory. You can verify by typing:

```bash
pwd  # Mac/Linux - shows current directory
cd   # Windows - shows current directory
```

---

### **Step 5: Set Up Environment Files**

The project uses `.env` files for configuration. You need to create these with your settings.

#### **Backend Configuration (.env)**

Create a file called `.env` in the `backend` folder:

```bash
# Mac/Linux - Create and edit the file
nano backend/.env

# Windows - Create and edit the file
echo > backend\.env
notepad backend\.env
```

**Copy and paste this into the file:**

```
# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# MongoDB Configuration
# Use the connection string from MongoDB Atlas (or your local MongoDB)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pepetor-miner?retryWrites=true&w=majority

# JWT Configuration (for authentication)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API Keys (for future integrations)
API_KEY_EXTERNAL=your_api_key_here
```

**⚠️ IMPORTANT:**
- Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your MongoDB Atlas credentials
- Replace the MongoDB connection string with your actual one
- Change JWT secrets to something random for production

**To save the file:**
- **nano:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`
- **notepad:** Press `Ctrl+S`

---

#### **Frontend Configuration (.env)**

Create a file called `.env` in the `frontend` folder:

```bash
# Mac/Linux
nano frontend/.env

# Windows
echo > frontend\.env
notepad frontend\.env
```

**Copy and paste this:**

```
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Environment
VITE_ENV=development

# Application
VITE_APP_NAME=PEPETOR-MINER
VITE_APP_VERSION=1.0.0

# Logging
VITE_LOG_LEVEL=debug
```

**To save:**
- **nano:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`
- **notepad:** Press `Ctrl+S`

---

### **Step 6: Install Dependencies**

This installs all the required packages.

```bash
npm run dev:setup
```

This command does the following:
- ✅ Installs root dependencies (`concurrently` - runs both servers)
- ✅ Installs backend dependencies (Express, MongoDB, etc.)
- ✅ Installs frontend dependencies (React, Vite, etc.)

**⏱️ Time:** Takes 2-5 minutes (depends on your internet)

**You'll see:**
```
npm warn ...
added XXX packages
```

✅ When done, you'll see no errors.

---

### **Step 7: Verify Everything is Installed**

Check that dependencies were installed correctly:

```bash
# Check root
ls node_modules | head

# Check backend
ls backend/node_modules | head

# Check frontend
ls frontend/node_modules | head
```

You should see folders listed. If they're empty or missing, run `npm run dev:setup` again.

---

### **Step 8: Test MongoDB Connection**

Make sure your MongoDB credentials are correct:

```bash
# This will test the database connection
npm run test:backend
```

You should see:
```
✅ MongoDB connected
✅ Database ready
```

If you see an error about MongoDB, check:
1. Is your MongoDB Atlas cluster running?
2. Is your username and password correct in `.env`?
3. Did you add your IP to MongoDB Atlas firewall?

---

## 🎬 Running the Application

### **Start the Development Servers**

Now everything is set up! Start both the backend and frontend with one command:

```bash
npm run dev
```

You should see:

```
BACKEND  │ 2024-11-01T... - GET /api/health
BACKEND  │ Server is running on port 3001
BACKEND  │ Database: MongoDB connected
FRONTEND │ VITE v5.0.8 ready in 245ms
FRONTEND │ ➜  Local:   http://localhost:3000/
```

---

## 🌐 Access the Application

1. **Open your browser**
2. **Go to:** `http://localhost:3000`
3. **You should see** the PEPETOR-MINER application loaded!

---

## 🎯 What's Running Now?

| Component | URL | What It Does |
|-----------|-----|--------------|
| **Frontend** | http://localhost:3000 | React application (what you see in browser) |
| **Backend API** | http://localhost:3001 | Server that manages data & authentication |
| **Health Check** | http://localhost:3001/api/health | Test if backend is running |

---

## 🛑 Stop the Application

Press in your terminal:

```
Ctrl + C
```

Both servers will stop cleanly. You'll see:

```
BACKEND  │ Server shutting down...
FRONTEND │ Vite dev server stopped
^C
```

---

## 🔄 Restart the Application

Just run again:

```bash
npm run dev
```

---

## 🐛 Troubleshooting

### ❌ "Port 3000 is already in use"

Another process is using port 3000.

**Solution:**

```bash
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then run `npm run dev` again.

---

### ❌ "Port 3001 is already in use"

Same as above, but for port 3001:

```bash
# Mac/Linux
lsof -i :3001
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

### ❌ "MongoDB connection failed"

The backend can't connect to MongoDB.

**Check:**

1. **Is MongoDB URI correct?**
   - Open `backend/.env`
   - Verify the `MONGODB_URI` line
   - Make sure username and password are correct

2. **Is MongoDB Atlas cluster running?**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign in
   - Check if your cluster is green (running)

3. **Is your IP whitelisted?**
   - In MongoDB Atlas → Network Access
   - Make sure your current IP is in the list
   - Or allow 0.0.0.0/0 (less secure but easier for testing)

4. **Test the connection:**
   ```bash
   npm run test:backend
   ```

---

### ❌ "concurrently not found" or "Cannot find module"

Dependencies weren't installed properly.

**Solution:**

```bash
npm run dev:setup
```

This reinstalls everything. Then try `npm run dev` again.

---

### ❌ "Frontend shows blank page or connection error"

The frontend can't connect to the backend API.

**Check:**

1. **Is backend running?**
   ```bash
   curl http://localhost:3001/api/health
   ```
   You should see a JSON response.

2. **Is CORS enabled?**
   - Open `backend/.env`
   - Make sure `CORS_ORIGIN=http://localhost:3000`

3. **Is frontend API URL correct?**
   - Open `frontend/.env`
   - Make sure `VITE_API_BASE_URL=http://localhost:3001/api`

---

### ❌ "npm: command not found"

Node.js or npm isn't installed.

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Try `npm run dev` again

---

## 📚 Common Commands

```bash
# Start both servers
npm run dev

# Start just backend
npm run dev:backend

# Start just frontend
npm run dev:frontend

# Install all dependencies
npm run dev:setup

# Lint code (find errors)
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Build for production
npm run build

# Run tests
npm test
```

---

## 🎓 Project Structure

```
PEPETOR-MINER/
├── backend/              # Express.js server
│   ├── src/
│   │   ├── index.js      # Main server file
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models
│   │   └── config/       # Configuration
│   └── package.json
│
├── frontend/             # React application
│   ├── src/
│   │   ├── main.jsx      # Entry point
│   │   ├── App.jsx       # Main component
│   │   └── pages/        # Page components
│   └── package.json
│
├── chrome-extension/     # Chrome browser extension
│
└── package.json         # Root configuration
```

---

## 🔗 Useful Links

- **Node.js:** https://nodejs.org/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **React Documentation:** https://react.dev/
- **Express Documentation:** https://expressjs.com/
- **GitHub:** https://github.com/

---

## ✅ Success Checklist

Before you consider setup complete:

- ✅ Node.js and npm installed
- ✅ Git installed
- ✅ Code cloned from GitHub
- ✅ `backend/.env` created with MongoDB URI
- ✅ `frontend/.env` created
- ✅ Dependencies installed (`npm run dev:setup`)
- ✅ MongoDB connection working
- ✅ Both servers start (`npm run dev`)
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend responds at http://localhost:3001/api/health

---

## 🎉 You're Ready!

Run this command and start developing:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## 💬 Need Help?

1. **Check logs** in your terminal - they show detailed error messages
2. **Read troubleshooting section** above
3. **Check the repository** issues on GitHub
4. **Ask in the project discussions** on GitHub

---

**Happy coding! 🚀**