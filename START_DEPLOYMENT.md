# 🚀 READY TO DEPLOY - Start Here!

**Status**: ✅ Your code is ready | **Time**: 30 minutes | **Cost**: Free to start

---

## 📱 What You'll Have After This

A **live website** at:
```
https://pepetor.com
```

That anyone in the world can visit!

---

## 🎯 3 Simple Steps

### **Step 1: Database (5 mins)**

Go to: **https://www.mongodb.com/cloud/atlas**

1. Sign up (click "Sign Up")
2. Create a free account with your email
3. Choose **M0 Free Tier** when asked
4. Select a region close to you
5. Wait for cluster to create
6. Click "Connect" → "Drivers" → Select "Node.js"
7. **Copy the connection string** (save it somewhere!)

**It looks like:**
```
mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/pepetor-miner?retryWrites=true&w=majority
```

---

### **Step 2: Deploy Your Backend (10 mins)**

Go to: **https://railway.app**

1. Click "Sign Up"
2. Choose "Continue with GitHub"
3. Click "New Project"
4. Click "Deploy from GitHub"
5. Search for and select **PEPETOR-MINER**
6. When it asks for variables, add these **4 things**:

   ```
   MONGODB_URI = [Paste your MongoDB string from Step 1]
   PORT = 3001
   NODE_ENV = production
   CORS_ORIGIN = https://pepetor.com
   ```

7. Click "Deploy"
8. Wait 2-3 minutes ☕
9. **Copy your Railway URL** (save it!)

**It looks like:**
```
https://pepetor-miner-production.up.railway.app
```

---

### **Step 3: Deploy Your Frontend (10 mins)**

Go to: **https://vercel.com**

1. Click "Sign Up"
2. Choose "Continue with GitHub"
3. Click "Add New" → "Project"
4. Click "Import Git Repository"
5. Search for **PEPETOR-MINER**
6. **IMPORTANT**: Set Root Directory = `apps/web`
7. Add this environment variable:

   ```
   VITE_API_BASE_URL = https://api.pepetor.com/api
   ```

8. Click "Deploy"
9. Wait 2-3 minutes ☕
10. When done, click the URL to see your live app!

---

## 🌐 Connect Your Domain (5 mins)

### Part A: Vercel
1. Go to **https://vercel.com/dashboard**
2. Click your **pepetor-miner** project
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Type: `pepetor.com`
6. **Copy all the DNS records** Vercel shows you

### Part B: Cloudflare
1. Go to **https://dash.cloudflare.com**
2. Click **pepetor.com**
3. Go to **DNS** tab
4. **Paste the DNS records** from Vercel
5. Then add ONE more record:
   - Type: `CNAME`
   - Name: `api`
   - Content: `pepetor-miner-production.up.railway.app`

6. Wait 5-15 minutes for DNS to update

---

## ✅ Test It!

1. Open browser
2. Go to: **https://pepetor.com**
3. You should see your React app! 🎉

If you see an error, wait another 5 minutes (DNS can be slow)

---

## 🎊 Success!

Your app is now **live on the internet**!

- **Website**: https://pepetor.com
- **API**: https://api.pepetor.com/api
- **Database**: MongoDB Atlas (your data is stored)

---

## 💰 What This Costs

- ✅ **FREE**: Vercel (frontend)
- ✅ **FREE**: MongoDB (first 0.5GB)
- 💵 **$5-10/month**: Railway (backend)
- 💵 **$8.88/year**: Domain (already paid)

**Total**: About **$70/year** or **~$6/month**

---

## 📖 Need More Details?

Check out these files:
- **DEPLOYMENT_GUIDE.md** - Step by step with screenshots
- **QUICK_DEPLOY_CHECKLIST.md** - Checkbox format

---

## 🆘 Something Not Working?

**"DNS not working"**
→ Wait 15 minutes and clear browser cache (Cmd+Shift+Delete)

**"Can't connect to API"**
→ Check that `CORS_ORIGIN` in Railway is set to `https://pepetor.com`

**"MongoDB error"**
→ Check the connection string is correct (no typos in password)

---

## 🎯 You're All Set!

**Next**: Follow the 3 steps above to go live! 

**Questions?** Check DEPLOYMENT_GUIDE.md

**Let's go!** 🚀