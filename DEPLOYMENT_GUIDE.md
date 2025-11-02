# 🚀 Complete Deployment Guide for pepetor.com

**Cost**: ~$70-100/year | **Setup Time**: ~30 minutes

---

## 📋 What We're Deploying

- **Backend API**: Express.js server running on Railway
- **Frontend**: React app running on Vercel  
- **Database**: MongoDB Atlas (free tier)
- **Domain**: pepetor.com pointing to both services

---

## 🔧 Step 1: Set Up MongoDB Atlas (Database) - 5 mins

### 1.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up"** (use your email)
3. Create a password
4. Click the **"M0 Free"** tier when prompted

### 1.2 Create Your First Database
1. Click **"Create Deployment"**
2. Select **"M0 Free Tier"** ✅
3. Select region closest to you (e.g., **US East** if you're in US)
4. Click **"Create Deployment"**
5. Wait 3-5 minutes for creation

### 1.3 Get Your Connection String
1. Click **"Connect"** (green button)
2. Click **"Drivers"**
3. Select **"Node.js"** from dropdown
4. Copy the connection string that looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   ```
5. **Replace**:
   - `username` → the username you created (default: `admin`)
   - `password` → the password you created
   - `myFirstDatabase` → `pepetor-miner`

**Example final string**:
```
mongodb+srv://admin:MyPassword123@cluster0.abcde.mongodb.net/pepetor-miner?retryWrites=true&w=majority
```

✅ **Save this string** - you'll need it for the backend

---

## 🌐 Step 2: Deploy Backend to Railway - 10 mins

### 2.1 Sign Up on Railway
1. Go to https://railway.app
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (easiest)
4. Authorize Railway to access your GitHub

### 2.2 Create New Project
1. Click **"New Project"** (or go to dashboard)
2. Click **"Deploy from GitHub"**
3. Click **"Connect GitHub Account"** if prompted
4. Search for **PEPETOR-MINER** repository
5. Click it to import

### 2.3 Configure Environment Variables
Railway will now ask you to configure:

1. Click **"Add Variable"** and enter:

   **Variable 1:**
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://admin:MyPassword123@cluster0.abcde.mongodb.net/pepetor-miner?retryWrites=true&w=majority
   ```
   (Use your MongoDB connection string from Step 1.3)

   **Variable 2:**
   ```
   Key: PORT
   Value: 3001
   ```

   **Variable 3:**
   ```
   Key: NODE_ENV
   Value: production
   ```

   **Variable 4:**
   ```
   Key: CORS_ORIGIN
   Value: https://pepetor.com
   ```

2. Click **"Deploy"**
3. Wait 2-3 minutes for deployment to complete

### 2.4 Get Your Backend URL
1. After deployment, click on your project
2. Click the **"Networking"** tab
3. Copy the **"Public URL"** (looks like `https://pepetor-miner-production.up.railway.app`)

✅ **Save this URL** - you'll need it for the frontend

---

## ⚛️ Step 3: Deploy Frontend to Vercel - 10 mins

### 3.1 Sign Up on Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### 3.2 Import Your Project
1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/PEPETOR-MINER`
4. Click **"Import"**

### 3.3 Configure Project Settings
1. Under **"Root Directory"**, select: `apps/web`
2. Click **"Environment Variables"**
3. Add this variable:

   ```
   Key: VITE_API_BASE_URL
   Value: https://pepetor-miner-production.up.railway.app/api
   ```
   (Use your Railway backend URL from Step 2.4)

4. Click **"Deploy"**
5. Wait 2-3 minutes for Vercel to build and deploy

### 3.4 Get Your Frontend URL
1. After deployment completes, Vercel shows you a **"Congratulations!"** screen
2. Copy the **URL** (default: `https://pepetor-miner.vercel.app`)

✅ **Save this URL** - you'll use it next

---

## 🌍 Step 4: Point Domain to Your Apps - 10 mins

### 4.1 Add Domain to Vercel (Frontend)
1. Go to https://vercel.com/dashboard
2. Click on your **pepetor-miner** project
3. Go to **"Settings"** → **"Domains"**
4. Click **"Add Domain"**
5. Enter: `pepetor.com`
6. Click **"Add"**
7. Vercel will show you DNS records to add to Cloudflare

### 4.2 Add DNS Records in Cloudflare
1. Go to https://dash.cloudflare.com
2. Click **"pepetor.com"**
3. Go to **"DNS"** section (left sidebar)
4. Add the DNS records that Vercel gave you (usually A or CNAME records)
5. Wait 5-10 minutes for DNS to propagate

### 4.3 Verify Frontend is Live
After DNS propagates, visit:
```
https://pepetor.com
```
You should see your React app! 🎉

### 4.4 Point API Subdomain to Railway
1. In **Cloudflare DNS**, click **"Add Record"**
2. Type: `CNAME`
3. Name: `api`
4. Content: Your Railway URL (without `https://`)
   - Example: `pepetor-miner-production.up.railway.app`
5. Click **"Save"**

Now your API is accessible at:
```
https://api.pepetor.com
```

---

## ✅ Step 5: Test Everything - 5 mins

### 5.1 Test Backend API
Open your browser and visit:
```
https://api.pepetor.com/api/users
```

You should see:
```json
[]
```
(Empty list, which is correct)

### 5.2 Test Frontend
Visit:
```
https://pepetor.com
```

You should see your React app load!

### 5.3 Check Chrome Extension
The extension will now connect to your live backend at `https://api.pepetor.com`

---

## 📊 Monitoring & Logs

### See Backend Logs (Railway)
1. Go to https://railway.app/dashboard
2. Click your project
3. Click **"View Logs"**
4. See real-time server logs

### See Frontend Logs (Vercel)
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **"Deployments"**
4. Click latest deployment to see build logs

### Check Database Status (MongoDB Atlas)
1. Go to https://cloud.mongodb.com
2. Click your cluster
3. See connection stats and usage

---

## 🎯 Environment Variables Summary

### Backend (.env in Railway)
```
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/pepetor-miner?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://pepetor.com
```

### Frontend (.env in Vercel via UI)
```
VITE_API_BASE_URL=https://api.pepetor.com/api
```

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **Cloudflare Registrar** | $8.88/year | Domain registration (already paid) |
| **MongoDB Atlas** | $0/month | Free tier: 0.5GB storage, perfect for starting |
| **Railway** | $5-10/month | Free tier available, $5 credit/month for 3 months |
| **Vercel** | $0/month | Free tier sufficient for frontend |
| **Total** | ~$70/year | **Less than $1/week!** |

---

## 🚀 Next Steps (After Deployment)

1. **Add More Features**
   - Implement user authentication (JWT)
   - Add more API endpoints
   - Expand frontend features

2. **Optimize**
   - Setup CI/CD pipeline on GitHub
   - Add automated tests
   - Monitor performance

3. **Scale**
   - Upgrade MongoDB tier ($57/month) if needed
   - Upgrade Railway plan as traffic grows
   - Add caching (Redis)

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB connection string is correct
- Verify username/password match
- Make sure IP is whitelisted in MongoDB Atlas (should be automatic)

### "API returns 403 CORS error"
- Check `CORS_ORIGIN` environment variable matches your frontend URL
- Make sure it starts with `https://`

### "Frontend won't load"
- Check DNS records are added to Cloudflare correctly
- Wait 10-15 minutes for DNS to fully propagate
- Clear browser cache (Cmd+Shift+Delete on Mac)

### "Deployment stuck"
- Check Railway/Vercel logs for errors
- Make sure `package.json` has correct start scripts
- Verify all environment variables are set

---

## 📱 Live URLs After Setup

```
Frontend:    https://pepetor.com
API:         https://api.pepetor.com/api
Dashboard:   https://api.pepetor.com/api/users
```

---

## 🎉 Congratulations!

Your app is now live on the internet! Share `https://pepetor.com` with anyone! 

**Questions?** Check the troubleshooting section or let me know!