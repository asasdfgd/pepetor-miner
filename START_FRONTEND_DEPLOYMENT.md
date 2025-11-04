# 🚀 START HERE: Frontend Deployment

**Current Status:** ✅ Everything Ready to Deploy

---

## ✅ Pre-Flight Check (Your System)

| Check | Status | Details |
|-------|--------|---------|
| Node.js | ✅ Ready | v22.20.0 |
| npm | ✅ Ready | Latest |
| React | ✅ Ready | 18.3.1 |
| Vite | ✅ Ready | 7.1.12 |
| Build Output | ✅ Ready | `dist/` exists (344KB) |
| Configuration | ✅ Ready | `vite.config.js` set up |

**Your frontend is production-ready!**

---

## 🎯 NEXT STEPS (Choose One)

---

## 📋 OPTION 1: Quick Test First (Recommended) - 2 minutes

Before deploying to production, test locally:

```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Preview the production build
npm run preview
```

**Visit:** http://localhost:4173

✅ **Check:**
- [ ] Page loads without errors
- [ ] No red errors in browser console (F12)
- [ ] Can navigate if multiple pages

---

## 🌐 OPTION 2: Deploy to Your Server

### A. Tell me about your server first:

**You need to answer:**
1. **What type of server do you have?**
   - [ ] Linux VPS (Linode, DigitalOcean, AWS, etc.)
   - [ ] Shared hosting (cPanel/WHM)
   - [ ] Docker container
   - [ ] Your existing website (provide URL)
   - [ ] Other: ___________

2. **Access method:**
   - [ ] SSH access
   - [ ] FTP/SFTP
   - [ ] Control panel (cPanel, Plesk, etc.)
   - [ ] Docker registry

3. **Web server:**
   - [ ] Nginx
   - [ ] Apache
   - [ ] Node.js server
   - [ ] Don't know

4. **API backend location:**
   - [ ] Same server as frontend
   - [ ] Different server/domain
   - [ ] URL: ___________

---

## 🚀 QUICK DEPLOYMENT SCENARIOS

### Scenario 1: Linux VPS with SSH + Nginx

```bash
# Step 1: On your local machine, build the app
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web
npm run build

# Step 2: Upload to your server
scp -r dist/* user@your-server.com:/var/www/pepetor-frontend/

# Step 3: SSH into server and configure Nginx
ssh user@your-server.com

# Run these commands on your server:
sudo nano /etc/nginx/sites-available/pepetor
```

**Paste this config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pepetor-frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(js|css|png|jpg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Then:**
```bash
sudo ln -s /etc/nginx/sites-available/pepetor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

✅ **Done!** Your app is now live at `http://your-domain.com`

---

### Scenario 2: Docker Container

```bash
# Create Dockerfile in /apps/web
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Build
docker build -t pepetor-frontend .

# Run (test)
docker run -p 3000:80 pepetor-frontend

# Visit: http://localhost:3000
```

---

### Scenario 3: Existing Website (Add to existing site)

```bash
# Copy build to your website
cp -r /Users/josephpietravalle/PEPETOR-MINER/apps/web/dist/* /path/to/your/website/

# Create .htaccess if using Apache
cat > /path/to/your/website/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
```

---

## 🔑 Important: Set Production API URL

**Before deployment, update your API endpoint:**

```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Create .env.local with your production API
cat > .env.local << 'EOF'
VITE_API_BASE_URL=https://your-api.com/api
EOF

# Rebuild with new API URL
npm run build
```

**Replace:** `https://your-api.com/api` with your actual backend URL

---

## 📁 File Structure After Build

```
/Users/josephpietravalle/PEPETOR-MINER/apps/web/
├── dist/                      ← What you deploy
│   ├── index.html            (460 bytes)
│   ├── assets/
│   │   ├── main.HASH.js      (minified React code)
│   │   ├── react.HASH.js     (minified React lib)
│   │   └── style.HASH.css    (minified styles)
│   └── favicon.ico           (app icon)
├── src/                        (source - don't deploy)
│   ├── App.jsx
│   ├── main.jsx
│   ├── pages/
│   └── components/
├── package.json              (dependencies)
├── vite.config.js           (build config)
└── .env.local               (your API URL - don't deploy)
```

**You only deploy the `dist/` folder!**

---

## 🛠️ Common Commands

```bash
# Navigate to web app
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check build size
du -sh dist/

# View actual file sizes
ls -lh dist/assets/
```

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Ran `npm run build` successfully
- [ ] Created `.env.local` with production API URL
- [ ] Tested locally with `npm run preview`
- [ ] No red errors in browser console
- [ ] Have server access info (SSH, FTP, etc.)
- [ ] Know your web server type (Nginx, Apache, etc.)

After deploying:
- [ ] Website loads at your domain
- [ ] No 404 errors on page refresh
- [ ] API calls reach your backend
- [ ] Check console for errors (F12)
- [ ] Verify cache headers working
- [ ] Test on mobile device

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run `npm install` first, check Node version (need v18+) |
| Blank page | Check API URL in .env.local, check browser console (F12) |
| 404 on refresh | Configure server routing (see config above) |
| API errors | Verify API URL is reachable, check CORS on backend |
| Old version showing | Clear browser cache (Ctrl+Shift+Delete) or restart server |
| File not found | Make sure you copied entire `dist/` folder, not just contents |

---

## 📞 What I Need to Help Further

To give you exact deployment steps, please tell me:

1. **Where is your backend API?**
   - Example: `https://api.pepetor.com` or `http://your-server.com:3001`

2. **Where is your server hosted?**
   - Example: DigitalOcean, AWS, your own machine, shared hosting, etc.

3. **How do you access your server?**
   - SSH, FTP, Control Panel, Docker, etc.

4. **What web server are you using?**
   - Nginx, Apache, Node.js, don't know

**Once you provide these details, I can give you the exact commands to run!**

---

## 🎯 The Simplest Path (3 Steps)

1. **Build locally:**
   ```bash
   cd /Users/josephpietravalle/PEPETOR-MINER/apps/web && npm run build
   ```

2. **Upload to server:**
   ```bash
   scp -r dist/* user@your-server.com:/var/www/html/
   ```

3. **Configure web server:**
   - Add Nginx config (see above)
   - Or add .htaccess for Apache (see above)
   - Or restart Node server

**Done! Your app is live.** 🚀

---

## 📚 Full Guides Available

- `FRONTEND_BUILD_DEPLOYMENT.md` - Comprehensive guide for all scenarios
- `FRONTEND_QUICK_START.md` - Quick reference commands

**Next step:** Reply with your server details, and I'll give you exact commands to run!