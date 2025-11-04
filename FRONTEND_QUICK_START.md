# 🚀 Frontend Build & Deploy Quick Start

**Time to Deploy:** ~15 minutes

---

## ✅ Pre-Deployment (Right Now)

### 1. Build the App
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

✅ **Result:** Check `dist/` folder was created with files

### 2. Set Production API URL
```bash
# Create .env.local with your production API
cat > /Users/josephpietravalle/PEPETOR-MINER/apps/web/.env.local << 'EOF'
VITE_API_BASE_URL=https://your-api-domain.com/api
EOF
```

**Replace:** `your-api-domain.com` with your actual backend domain

### 3. Rebuild with New API URL
```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web
npm run build
```

✅ **Result:** `dist/` folder now has production build

---

## 🚀 Choose Your Deployment Method

### Method 1: Quick Upload (If you have server SSH)
```bash
# Upload dist folder to your server
scp -r /Users/josephpietravalle/PEPETOR-MINER/apps/web/dist/* \
    user@your-server.com:/var/www/html/

# SSH to server and configure
ssh user@your-server.com

# Update Nginx config if needed (see full guide)
```

### Method 2: Docker (Recommended)
```bash
# Run these commands in apps/web folder
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Build Docker image
docker build -t pepetor-frontend .

# Run locally to test
docker run -p 3000:80 pepetor-frontend

# Visit: http://localhost:3000
```

### Method 3: Use Your Existing Website
```bash
# Copy dist folder to your website root
cp -r /Users/josephpietravalle/PEPETOR-MINER/apps/web/dist/* \
    /path/to/your/website/miner/
```

---

## 🧪 Test Build Locally (Before Uploading)

```bash
cd /Users/josephpietravalle/PEPETOR-MINER/apps/web

# Preview the production build locally
npm run preview

# Open in browser: http://localhost:4173
```

✅ **Check:**
- Page loads without blank white screen
- No red errors in browser console (F12)
- Navigation works if you have multiple pages
- Can see the PEPETOR interface

---

## 📋 Deployment Configuration Files

### For Nginx Servers
Copy this to `/etc/nginx/sites-available/pepetor`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pepetor-frontend;
    index index.html;

    # React Router - serve index.html for all routes
    location / {
        try_files $uri /index.html;
    }

    # Cache static assets (1 year)
    location ~* \.(js|css|png|jpg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then run:
```bash
sudo ln -s /etc/nginx/sites-available/pepetor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### For Apache Servers
Create `.htaccess` in your website root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### For Docker
Create `Dockerfile` in apps/web folder:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔗 File Locations

| Item | Path |
|------|------|
| **Source Code** | `/apps/web/src/` |
| **Build Output** | `/apps/web/dist/` |
| **Config** | `/apps/web/vite.config.js` |
| **Env Variables** | `/apps/web/.env.local` |
| **Package Info** | `/apps/web/package.json` |

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| **Blank page on load** | Check browser console (F12), verify API URL in .env.local |
| **404 on page refresh** | Configure server: Nginx `try_files`, Apache `.htaccess`, Node middleware |
| **API calls fail** | Check backend URL in .env.local, verify CORS enabled on backend |
| **Old version cached** | Clear browser cache (Ctrl+Shift+Delete), or restart web server |
| **Slow page load** | Check gzip enabled on server, verify minified files in dist/ |

---

## ✅ Post-Deployment Tests

After uploading to server:

```bash
# 1. Test site loads
curl -I https://your-domain.com
# Should return: HTTP/1.1 200 OK

# 2. Test React app
curl https://your-domain.com | grep "react"
# Should find React code

# 3. Test API endpoint
curl https://your-domain.com/api/users
# Should connect to backend

# 4. Check in browser
# Open: https://your-domain.com
# Should see PEPETOR Miner interface
```

---

## 🎯 Key Commands Reference

```bash
# Build
npm run build

# Preview build
npm run preview

# Check build output size
du -sh /Users/josephpietravalle/PEPETOR-MINER/apps/web/dist/

# Upload to server (if using SCP)
scp -r dist/* user@server.com:/var/www/html/

# SSH to server
ssh user@server.com

# Restart web server
sudo systemctl restart nginx    # Nginx
sudo systemctl restart apache2  # Apache
docker restart container_name   # Docker
```

---

## 📊 Build Output Explained

After `npm run build`, you get:

```
✓ built in 2.8s

dist/index.html            1.23 kB │ gzip:  0.95 kB
dist/assets/main.HASH.js   245.67 kB │ gzip: 85.32 kB
dist/assets/style.HASH.css 15.32 kB │ gzip:  3.21 kB
```

- **HASH:** Cache busting - changes when code changes
- **gzip:** Compressed size (what users download)
- **Total:** ~89 KB gzipped

---

## 🚀 30-Second Deployment Summary

1. **Build:** `npm run build` in `/apps/web/`
2. **Upload:** Copy `/apps/web/dist/*` to your server
3. **Configure:** Set web server to serve `index.html` for all routes
4. **Test:** Visit your domain, check console for errors

**That's it!** Your frontend is deployed.

---

## 📞 Need Help?

- **Build issues:** Check `npm run build` output for errors
- **Deployment issues:** Verify server is running, check web server config
- **API issues:** Verify backend is reachable from frontend domain
- **Performance:** Check gzip enabled, cache headers set, minified files served

---

**Full detailed guide:** See `FRONTEND_BUILD_DEPLOYMENT.md`