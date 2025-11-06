# Frontend Build & Deployment Guide

## 📍 Your Setup
- **Frontend Location:** `/apps/web/`
- **Build Tool:** Vite
- **Framework:** React 18
- **Output:** `dist/` folder
- **Target:** Your own server/website

---

## 🔨 STEP 1: Build the Frontend (5 minutes)

### 1.1 Install Dependencies
```bash
cd apps/web
npm install
```

### 1.2 Configure Production Environment
Create `.env.local`:
```bash
# Copy the example
cp .env.example .env.local

# Edit with your production API URL
nano .env.local
```

Update the file with your production API:
```
# .env.local
VITE_API_BASE_URL=https://your-domain.com/api
```

### 1.3 Build for Production
```bash
npm run build
```

**Expected Output:**
```
✓ built in 3.5s
  dist/index.html         1.23 kB
  dist/assets/main.*.js   245.67 kB
  dist/assets/style.*.css 15.32 kB
```

**Result:** Static files are ready in `dist/` folder

---

## 🚀 STEP 2: Deploy to Your Server

### Option A: Traditional VPS/Server (Nginx)

#### A.1 Upload Files to Server
```bash
# From your local machine, upload dist folder
scp -r dist/ user@your-server.com:/var/www/pepetor-frontend/

# Or with rsync
rsync -avz dist/ user@your-server.com:/var/www/pepetor-frontend/
```

#### A.2 Configure Nginx
```bash
# SSH into your server
ssh user@your-server.com

# Create Nginx config
sudo nano /etc/nginx/sites-available/pepetor
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/pepetor-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Serve index.html for React Router
    location / {
        try_files $uri /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

#### A.3 Enable & Test
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pepetor /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Option B: Docker Container

#### B.1 Create Dockerfile
```bash
cd apps/web
cat > Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
```

#### B.2 Create Nginx Config
```bash
cat > nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    gzip on;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        location ~* \.(js|css|png|jpg|gif|ico)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
```

#### B.3 Build & Push Docker Image
```bash
# Build image
docker build -t pepetor-frontend:latest .

# Tag for registry (if using Docker Hub)
docker tag pepetor-frontend:latest yourusername/pepetor-frontend:latest

# Push to registry
docker push yourusername/pepetor-frontend:latest

# Run locally to test
docker run -p 3000:80 pepetor-frontend:latest
```

---

### Option C: Your Existing Website (Subdirectory)

#### C.1 Add Frontend to Existing Site

**If using Apache:**
```bash
# Copy dist to your website root
cp -r dist/* /var/www/html/miner/

# Create .htaccess for routing
cat > /var/www/html/miner/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /miner/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /miner/index.html [L]
</IfModule>
EOF
```

**If using Nginx:**
```nginx
location /miner/ {
    alias /var/www/html/miner/;
    try_files $uri $uri/ /miner/index.html;
}
```

#### C.2 Update Frontend Configuration
```bash
# .env.local should point to your API
VITE_API_BASE_URL=https://your-domain.com/api
```

---

## 📋 STEP 3: Production Checklist

### Pre-Deployment
- [ ] `.env.local` created with correct API URL
- [ ] `npm run build` completes successfully
- [ ] `dist/` folder exists with files
- [ ] No build errors or warnings

### Post-Deployment (Test)
- [ ] Website loads at `your-domain.com`
- [ ] Page doesn't show 404 errors
- [ ] Navigation works (React Router)
- [ ] API calls reach backend
- [ ] Check browser DevTools Console (F12) for errors
- [ ] Check Network tab for failed requests

### Performance
- [ ] Page loads < 3 seconds
- [ ] CSS/JS files cached (long expiration)
- [ ] Gzip compression enabled
- [ ] Images optimized

---

## 🔍 STEP 4: Troubleshooting

### Issue: 404 on page refresh
**Solution:** Configure server to serve `index.html` for all routes
- Nginx: Use `try_files $uri /index.html`
- Apache: Use `.htaccess` rewrite rules
- Node: Use static middleware

### Issue: API calls fail (CORS error)
**Solution:** Backend needs to allow your frontend domain
```javascript
// backend/src/index.js (Express)
const cors = require('cors');
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

### Issue: Blank page or "Cannot GET /"
**Solution:** Check if web server is serving files correctly
```bash
# SSH to server and check
ls -la /var/www/pepetor-frontend/dist/
cat /var/www/pepetor-frontend/dist/index.html
```

### Issue: Outdated cache showing
**Solution:** Clear browser cache or use cache busting
```bash
# Vite automatically adds hashes to file names
# But you can force clear on server:
curl -I https://your-domain.com  # Check cache headers
```

---

## 🌐 STEP 5: Domain & SSL Setup

### SSL Certificate (HTTPS)
```bash
# Using Let's Encrypt on your server
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (included with certbot)
sudo systemctl enable certbot.timer
```

### Update Nginx to redirect HTTP to HTTPS
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/pepetor-frontend;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Serve index.html for React Router
    location / {
        try_files $uri /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

---

## 📊 STEP 6: Monitoring & Logs

### Check Deployment
```bash
# SSH to server
ssh user@your-server.com

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check CPU/Memory
top
```

### Application Performance
```bash
# Frontend size check
du -sh /var/www/pepetor-frontend/dist/

# File breakdown
du -sh /var/www/pepetor-frontend/dist/assets/*
```

---

## 🔄 STEP 7: Updates & Redeployment

### Update Process
```bash
# 1. Build new version locally
cd apps/web
git pull origin main  # Get latest code
npm install           # Update dependencies
npm run build         # Build

# 2. Upload to server
scp -r dist/* user@your-server.com:/var/www/pepetor-frontend/

# 3. Verify (no server restart needed - static files)
curl https://your-domain.com
```

### Automated Deployment (CI/CD)
```bash
# Using GitHub Actions - create .github/workflows/deploy.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['apps/web/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: cd apps/web && npm ci && npm run build
      
      - uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "apps/web/dist"
          target: "/var/www/pepetor-frontend"
          strip_components: 3
```

---

## 🎯 Quick Command Reference

```bash
# Local development
cd apps/web && npm run dev

# Build for production
cd apps/web && npm run build

# Test build locally
npm run preview

# Upload to server
scp -r dist/* user@server.com:/var/www/pepetor-frontend/

# SSH to server
ssh user@server.com

# Restart web server
sudo systemctl restart nginx

# View logs
tail -f /var/log/nginx/access.log
```

---

## 🎓 Key Information

### What Gets Deployed
- **HTML:** Entry point for React app
- **JavaScript:** Bundled React code (~245KB gzipped)
- **CSS:** Bundled styles (~15KB gzipped)
- **Assets:** Images, fonts, etc.

### What Stays Local
- Environment variables (`.env.local` - NOT uploaded)
- Build cache (`node_modules/`)
- Source maps (if disabled in build)

### File Structure After Build
```
dist/
├── index.html              (1.2 KB)
├── assets/
│   ├── main.HASH.js        (245 KB)
│   ├── react.HASH.js       (150 KB)
│   └── style.HASH.css      (15 KB)
└── favicon.ico             (4 KB)
```

---

## ✅ Deployment Verification

```bash
# Check site is live
curl -I https://your-domain.com
# Should return: HTTP/1.1 200 OK

# Check React app loads
curl https://your-domain.com | grep "react"

# Check API connectivity
curl https://your-domain.com/api/sessions/policy
# Should return: JSON response with policy data

# Check cache headers
curl -I https://your-domain.com/assets/main*.js
# Should show: Cache-Control: public, immutable, max-age=...
```

---

## 🚀 Next Steps

1. **Choose your hosting:** VPS, Docker, or existing site
2. **Run local build:** `npm run build` in `/apps/web/`
3. **Test locally:** `npm run preview`
4. **Deploy:** Upload `dist/` to your server
5. **Configure:** Set up web server (Nginx/Apache)
6. **Verify:** Check site loads and API works
7. **Monitor:** Check logs for errors
8. **Update:** Re-deploy when changes made

---

**Ready to deploy? Start with Step 1 above!**