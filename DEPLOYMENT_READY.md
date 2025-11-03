# 🚀 CLEARNETLABS.FUN - Ready for Deployment

## Status: ✅ MARKETING ENHANCED & READY TO DEPLOY

Your website now has a professional landing page with:
- ✅ Hero section with strong CTAs
- ✅ 6 features with emojis
- ✅ "How It Works" 4-step guide
- ✅ Extension showcase
- ✅ Social proof (stats section)
- ✅ FAQ teaser
- ✅ Full Extension download page (/extension)
- ✅ Full FAQ page with 27 questions (/faq)
- ✅ Updated navigation
- ✅ Professional styling & animations

---

## DEPLOYMENT CHECKLIST

### ✅ STEP 1: Prepare Backend for Railway

**Time: 5 minutes**

```bash
# Your backend is ready to deploy!
# Database credentials:
MONGODB_URI=mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs
```

### ✅ STEP 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Create New Project"**
3. Select **"Deploy from GitHub"**
4. Choose your PEPETOR-MINER repo
5. **Configure:**
   - **Root Directory**: `apps/api`
   - **Build Command**: (leave blank)
   - **Start Command**: `npm start`

6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs
   CORS_ORIGIN=https://clearnetlabs.fun
   JWT_SECRET=your_secret_here_min_32_chars
   ```

7. **Deploy** and copy your **Railway URL** (will look like: `https://api-prod-xxx.railway.app`)

---

### ✅ STEP 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo
4. **Configure:**
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://api-prod-xxx.railway.app/api
   ```
   *(Replace with your actual Railway URL)*

6. **Deploy** - Vercel auto-deploys on git push

---

### ✅ STEP 4: Connect Domain

1. In Vercel → **Settings** → **Domains**
2. Add `clearnetlabs.fun`
3. Vercel gives you DNS instructions
4. Add CNAME record to your domain registrar:
   - **Type**: CNAME
   - **Name**: `@` or leave blank
   - **Value**: `cname.vercel.com`

5. Wait 10-60 minutes for DNS propagation

---

## Testing Checklist (After Deployment)

- [ ] Visit https://clearnetlabs.fun
- [ ] Homepage loads with new marketing copy
- [ ] Navigation shows Extension & FAQ links
- [ ] Click Extension page → downloads work
- [ ] Click FAQ page → accordion works
- [ ] Create account
- [ ] Login works
- [ ] Dashboard loads with API data
- [ ] Check browser Network tab for API calls
- [ ] No CORS errors in console

---

## Quick Deploy Command (After Setup)

Just push to GitHub and both will auto-deploy:
```bash
git push origin main
```

---

## Important Notes

⚠️ **MongoDB Whitelist**: Make sure your MongoDB Atlas allows connections from Railway's IPs. Usually it's set to "Allow from anywhere" (0.0.0.0/0).

⚠️ **JWT Secret**: Change `JWT_SECRET` to something secure! Generate with:
```bash
openssl rand -base64 32
```

⚠️ **CORS**: Make sure `CORS_ORIGIN` matches your domain exactly (https://, not http://)

---

## Estimated Timeline

- Railroad setup: 5 min
- Vercel setup: 5 min
- Domain DNS: 10-60 min
- **Total**: ~20-80 minutes

---

## Next Steps After Going Live

1. **Monitor**: Set up error tracking (Sentry)
2. **Analytics**: Add Google Analytics
3. **SEO**: Add meta tags and sitemap
4. **Email**: Set up verification emails
5. **Support**: Add support email (support@clearnetlabs.fun)
6. **Chrome Web Store**: Submit extension to Chrome Web Store

---

## Support

If you get stuck:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

You're ready to go live! 🚀