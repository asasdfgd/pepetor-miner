# 🚀 Deployment Guide: Vultr + Vercel for clearnetlabs.fun

## Overview
- **Backend**: Deploy to Vultr VPS (Docker)
- **Frontend**: Deploy to Vercel (Vite)
- **Database**: MongoDB Atlas (already configured)
- **Domain**: clearnetlabs.fun → Vercel

---

## ⏱️ Timeline
- Vultr setup: 15 minutes
- Vercel setup: 5 minutes
- Domain DNS: 10-60 minutes
- **Total: 30-80 minutes**

---

## 🚀 STEP 1: Deploy Backend to Vultr (15 min)

### 1.1 Create Vultr Account
1. Go to [vultr.com](https://vultr.com)
2. Sign up (or login)
3. Add payment method

### 1.2 Create Server
1. Click **"Deploy New Instance"** or **"+"** button
2. Choose server type: **"Cloud Compute"**
3. **Location**: Pick closest to your users (or US East)
4. **Operating System**: **Ubuntu 22.04 LTS** (latest stable)
5. **Server Size**: **$2.50/month** (512 MB RAM) is enough to start
   - If you need more power: $4-6/month gives better performance
6. **Auto Backups**: Optional (skip for now)
7. Click **"Deploy Now"**

### 1.3 Access Your Server
1. Wait 1-2 minutes for server to boot
2. Copy your **IPv4 address** (you'll see it on dashboard)
3. Open Terminal and connect via SSH:
   ```bash
   ssh root@YOUR_IPV4_ADDRESS
   ```
   - Answer "yes" when asked about fingerprint
   - Use password from Vultr email

### 1.4 Install Docker & Git
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
apt install -y docker.io docker-compose

# Start Docker
systemctl start docker
systemctl enable docker

# Install Git
apt install -y git

# Add root to docker group (so no sudo needed)
usermod -aG docker root
```

### 1.5 Clone Your Repository
```bash
# Go to home directory
cd ~

# Clone your repo (make sure it's public on GitHub, or use SSH key)
git clone https://github.com/YOUR_USERNAME/PEPETOR-MINER.git
cd PEPETOR-MINER/apps/api
```

### 1.6 Build & Run Docker Container
```bash
# Build Docker image
docker build -t pepetor-api:latest .

# Run container with environment variables
docker run -d \
  --name pepetor-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e MONGODB_URI="mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs" \
  -e CORS_ORIGIN="https://clearnetlabs.fun" \
  -e JWT_SECRET="YOUR_SECRET_HERE_MIN_32_CHARS" \
  -v /data/pepetor:/app/data \
  pepetor-api:latest
```

⚠️ **Generate secure JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 1.7 Verify Backend is Running
```bash
# Check if container is running
docker ps

# Test health endpoint
curl http://localhost:3001/api/health
```

You should see JSON response:
```json
{
  "success": true,
  "status": "Server is running",
  "database": { "status": "connected", "name": "MongoDB" }
}
```

### 1.8 Get Your Backend URL
Your backend is now running at:
```
http://YOUR_IPV4_ADDRESS:3001/api
```

**Example**: `http://192.168.1.100:3001/api`

### 1.9 (Optional) Setup Auto-Restart on Reboot
```bash
# Create systemd service file
cat > /etc/systemd/system/pepetor-api.service << EOF
[Unit]
Description=PEPETOR API Container
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker start -a pepetor-api

[Install]
WantedBy=multi-user.target
EOF

# Enable service
systemctl daemon-reload
systemctl enable pepetor-api.service
```

---

## 🎨 STEP 2: Deploy Frontend to Vercel (5 min)

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.2 Import Project
1. Click **"Add New"** → **"Project"**
2. Select **"Import Git Repository"**
3. Choose `PEPETOR-MINER` repo

### 2.3 Configure Frontend
When Vercel asks for settings:

**Project Settings:**
- **Framework**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.4 Add Environment Variable
Click **"Environment Variables"** and add:

```
VITE_API_BASE_URL=http://YOUR_VULTR_IP:3001/api
```

⚠️ **Replace** `YOUR_VULTR_IP` with your actual Vultr server IPv4 address

**Example**: `http://192.168.1.100:3001/api`

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for Vercel build
3. You'll get a Vercel URL: `https://pepetor-miner.vercel.app`

---

## 🌐 STEP 3: Connect Domain (10-60 min)

### 3.1 Add Domain to Vercel
1. In Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `clearnetlabs.fun`
4. Vercel shows you two DNS options (pick CNAME)

### 3.2 Update DNS at Your Registrar
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find **DNS Settings**
3. Add CNAME record:
   - **Type**: CNAME
   - **Name**: `@` (or leave blank)
   - **Value**: `cname.vercel.com`

4. Wait 10-60 minutes for DNS propagation
5. Test: `nslookup clearnetlabs.fun`

---

## 🔒 STEP 4: Update Backend CORS (After Domain is Live)

Once DNS propagates and your domain works:

1. SSH into your Vultr server:
   ```bash
   ssh root@YOUR_IPV4_ADDRESS
   ```

2. Stop and update container:
   ```bash
   docker stop pepetor-api
   docker rm pepetor-api
   
   docker run -d \
     --name pepetor-api \
     -p 3001:3001 \
     -e NODE_ENV=production \
     -e PORT=3001 \
     -e MONGODB_URI="mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs" \
     -e CORS_ORIGIN="https://clearnetlabs.fun" \
     -e JWT_SECRET="YOUR_SECRET_HERE_MIN_32_CHARS" \
     -v /data/pepetor:/app/data \
     pepetor-api:latest
   ```

---

## ✅ STEP 5: Verification Checklist

- [ ] Vultr server created and running
- [ ] Docker container running on Vultr
- [ ] Backend health check works: `curl http://YOUR_IP:3001/api/health`
- [ ] Vercel project created and deployed
- [ ] Vercel URL shows homepage
- [ ] Domain DNS records added
- [ ] `clearnetlabs.fun` loads in browser
- [ ] No CORS errors in browser console
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads with API data

---

## 🛠️ Useful Vultr Commands

**SSH into server:**
```bash
ssh root@YOUR_VULTR_IP
```

**Check container logs:**
```bash
docker logs pepetor-api -f
```

**Restart container:**
```bash
docker restart pepetor-api
```

**Update backend code (after git push):**
```bash
cd ~/PEPETOR-MINER/apps/api
git pull origin main
docker build -t pepetor-api:latest .
docker stop pepetor-api
docker rm pepetor-api
docker run -d \
  --name pepetor-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e MONGODB_URI="mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs" \
  -e CORS_ORIGIN="https://clearnetlabs.fun" \
  -e JWT_SECRET="YOUR_SECRET_HERE_MIN_32_CHARS" \
  -v /data/pepetor:/app/data \
  pepetor-api:latest
```

**Remove container:**
```bash
docker stop pepetor-api
docker rm pepetor-api
```

---

## 🚨 Troubleshooting

### **CORS Error in Browser**
- Make sure `CORS_ORIGIN` environment variable = `https://clearnetlabs.fun`
- Restart container after changing env var

### **Frontend can't reach backend**
- Check `VITE_API_BASE_URL` in Vercel env variables
- Make sure it includes `/api` at the end
- Example: `http://192.168.1.100:3001/api`

### **MongoDB connection fails**
- SSH into Vultr server
- Run: `curl -I https://clearnetlabs.tujf12x.mongodb.net` (should be 403/401, not timeout)
- Check `MONGODB_URI` format in Docker environment

### **Can't SSH into Vultr server**
- Make sure you're using the root password from Vultr email
- Try: `ssh -v root@YOUR_IP` for debugging

### **Docker image won't build**
- SSH into server: `docker build -t pepetor-api:latest .` and check error
- Make sure you're in `/root/PEPETOR-MINER/apps/api` directory

---

## 📊 Performance Tips

1. **Vultr $2.50/mo**: Good for testing, may be slow under load
2. **Vultr $5+/mo**: Recommended for production
3. **Use CDN**: Cloudflare can cache your API (optional)
4. **Monitor**: Use `docker stats` to watch CPU/RAM usage

---

## 🎉 Next Steps (After Going Live)

1. Set up SSL cert for backend (optional, already have HTTPS on Vercel)
2. Add monitoring/alerts
3. Set up backups
4. Submit extension to Chrome Web Store
5. Add analytics

---

## ⚡ Quick Deploy Script

After your first deployment, you can use this to quickly update:

```bash
#!/bin/bash
# Save as ~/update-pepetor.sh

cd ~/PEPETOR-MINER/apps/api
git pull origin main
docker build -t pepetor-api:latest .
docker stop pepetor-api || true
docker rm pepetor-api || true
docker run -d \
  --name pepetor-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e MONGODB_URI="mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs" \
  -e CORS_ORIGIN="https://clearnetlabs.fun" \
  -e JWT_SECRET="YOUR_SECRET_HERE_MIN_32_CHARS" \
  -v /data/pepetor:/app/data \
  pepetor-api:latest

echo "✅ Backend redeployed!"
```

Run with: `bash ~/update-pepetor.sh`

---

## Support

- Vultr Docs: https://www.vultr.com/docs/
- Docker Docs: https://docs.docker.com/
- Vercel Docs: https://vercel.com/docs

🚀 You're ready to deploy!