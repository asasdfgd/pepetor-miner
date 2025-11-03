# Deployment Guide: clearnetlabs.fun

## Overview
- **Frontend**: Deploy to Vercel (React app)
- **Backend**: Deploy to Railway (Node.js/Express)
- **Database**: MongoDB Atlas (already deployed)
- **Domain**: clearnetlabs.fun → Vercel

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 1.2 Deploy Express Backend
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Connect your GitHub repo (`PEPETOR-MINER`)
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: (leave empty - uses package.json)
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://Clearnetmoney:your_password@clearnetlabs.mongodb.net/pepetor-miner
   CORS_ORIGIN=https://clearnetlabs.fun
   JWT_SECRET=your_jwt_secret
   ```
6. Deploy and note the **public Railway URL** (e.g., `https://api-prod-xyz.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 2.2 Configure Frontend Deployment
1. **Project Settings:**
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://api-prod-xyz.railway.app/api
   ```
   (Replace with actual Railway URL from Step 1.2)

3. **Deploy** - Vercel will auto-deploy on Git push

### 2.3 Get Vercel Domain
- After deployment, copy your **Vercel URL** (e.g., `https://pepetor-web.vercel.app`)

---

## Step 3: Connect Domain

### 3.1 Add Domain to Vercel
1. In Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter `clearnetlabs.fun`
4. Follow DNS configuration instructions

### 3.2 Update DNS Records
In your domain registrar (GoDaddy, Namecheap, etc.):
1. Create CNAME record:
   - **Type**: CNAME
   - **Name**: `www` or `@`
   - **Value**: `cname.vercel.com`
2. Wait 10-60 minutes for DNS to propagate

---

## Step 4: Update Backend CORS

Once domain is active, update Railway env var:
```
CORS_ORIGIN=https://clearnetlabs.fun
```

---

## Verification Checklist

- [ ] Backend deployed to Railway
- [ ] Backend Railway URL obtained
- [ ] Frontend env var `VITE_API_BASE_URL` updated
- [ ] Frontend deployed to Vercel
- [ ] Domain DNS records added
- [ ] Domain accessible at https://clearnetlabs.fun
- [ ] Frontend loads
- [ ] API calls work (check Network tab in DevTools)
- [ ] Login/Register functional
- [ ] Dashboard loads with real data

---

## Useful Commands

**Build frontend locally:**
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web
npm run build
npm run preview  # Test production build locally
```

**Test backend locally with production MongoDB:**
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/api
npm start
```

---

## Troubleshooting

**Issue**: CORS errors in browser console
- **Fix**: Ensure `CORS_ORIGIN` in backend matches your domain exactly (https://, not http://)

**Issue**: Frontend can't reach backend API
- **Fix**: Verify `VITE_API_BASE_URL` env var is set correctly and Railway backend is running

**Issue**: MongoDB connection fails
- **Fix**: Check `MONGODB_URI` format and IP whitelist in MongoDB Atlas

---

## Next Steps (Optional Enhancements)

1. Add landing page with feature showcase
2. Add docs/help pages
3. Add Chrome extension download page
4. Set up CI/CD for automatic deployments
5. Monitor errors with Sentry or similar
6. Set up SSL certificate (Vercel handles this automatically)
