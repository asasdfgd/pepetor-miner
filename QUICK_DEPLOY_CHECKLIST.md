# ⚡ Quick Deployment Checklist

**Time to Deploy**: ~30 minutes | **Cost**: ~$70/year

---

## 📋 Pre-Deployment Checklist

- [ ] You have `pepetor.com` purchased on Cloudflare
- [ ] WHOIS privacy is enabled ✅ (Cloudflare does this automatically)
- [ ] Git repository is on GitHub and public
- [ ] All code is committed and pushed

---

## 🗄️ Step 1: MongoDB Atlas (5 mins)

- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account with email
- [ ] Create M0 Free cluster
- [ ] Get connection string
- [ ] **Save connection string** for Step 2

---

## 🚀 Step 2: Deploy Backend to Railway (10 mins)

- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Click "Deploy from GitHub"
- [ ] Select PEPETOR-MINER repository
- [ ] Add environment variables:
  - [ ] `MONGODB_URI` = Your MongoDB connection string
  - [ ] `PORT` = `3001`
  - [ ] `NODE_ENV` = `production`
  - [ ] `CORS_ORIGIN` = `https://pepetor.com`
- [ ] Wait for deployment to complete
- [ ] **Save Railway URL** for Step 3

**Example Railway URL**: `https://pepetor-miner-production.up.railway.app`

---

## ⚛️ Step 3: Deploy Frontend to Vercel (10 mins)

- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Click "New Project"
- [ ] Click "Import Git Repository"
- [ ] Select PEPETOR-MINER repository
- [ ] Configure:
  - [ ] Root Directory = `apps/web`
  - [ ] Add environment variable: `VITE_API_BASE_URL` = `https://api.pepetor.com/api`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] **Save Vercel URL**

**Example Vercel URL**: `https://pepetor-miner.vercel.app`

---

## 🌐 Step 4: Connect Domain (10 mins)

### 4A. Add Domain to Vercel
- [ ] Go to Vercel dashboard
- [ ] Select pepetor-miner project
- [ ] Go to Settings → Domains
- [ ] Add domain: `pepetor.com`
- [ ] Copy DNS records that Vercel shows

### 4B. Update Cloudflare DNS
- [ ] Go to https://dash.cloudflare.com
- [ ] Click `pepetor.com`
- [ ] Go to DNS tab
- [ ] Add DNS records from Vercel (usually A or CNAME)
- [ ] Add API subdomain:
  - [ ] Type: CNAME
  - [ ] Name: `api`
  - [ ] Content: Your Railway URL (without https://)
  - [ ] Example: `pepetor-miner-production.up.railway.app`

---

## ✅ Step 5: Test Everything (5 mins)

- [ ] Visit `https://pepetor.com` → See React app
- [ ] Visit `https://api.pepetor.com/api/health` → See `{"status":"ok"}`
- [ ] Open browser DevTools (F12) on pepetor.com
- [ ] Check Console tab → No red errors ✅

---

## 📊 Final Setup Summary

| Service | URL | Login |
|---------|-----|-------|
| **Frontend** | https://pepetor.com | Vercel Dashboard |
| **API** | https://api.pepetor.com/api | Railway Dashboard |
| **Database** | MongoDB Atlas | https://cloud.mongodb.com |
| **Domain** | pepetor.com | Cloudflare Dashboard |

---

## 💰 Cost Verification

- **MongoDB Atlas**: FREE ✅ (0.5GB)
- **Vercel**: FREE ✅ (for frontend)
- **Railway**: $5-10/month (has $5 free credit/month for 3 months)
- **Cloudflare Domain**: $8.88/year
- **Total First Year**: ~$70 (basically free)

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find MongoDB" | Check connection string is correct in Railway env vars |
| "CORS error in console" | Wait 10 mins for DNS to propagate, clear browser cache |
| "Deployment stuck" | Check Railway/Vercel logs for error messages |
| "pepetor.com not loading" | Wait 15 mins for DNS, might need to clear cache |

---

## 📱 Share Your Live App

Once everything works, share:
```
https://pepetor.com
```

Anyone can now access your app! 🎉

---

## 🚀 What's Next?

1. **Share**: Send https://pepetor.com to friends
2. **Monitor**: Check Railway/Vercel dashboards for errors
3. **Feature**: Add more features to your app
4. **Scale**: Upgrade services as needed

---

**Need help?** Check DEPLOYMENT_GUIDE.md for detailed instructions.