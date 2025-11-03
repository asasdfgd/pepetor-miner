# ⚡ Vultr + Vercel Deployment - Quick Start

## 🎯 5-Step Deployment Process

---

## ✅ STEP 0: Push Latest Code to GitHub (2 min)

```bash
cd /Users/josephpietravalle/PEPETOR-MINER
git add .
git commit -m "Add Docker config for Vultr deployment"
git push origin main
```

**Verify it's pushed:**
- Go to https://github.com/asasdfgd/PEPETOR-MINER
- Check that `apps/api/Dockerfile` exists

---

## 🚀 STEP 1: Create Vultr Server (5 min)

### Action Items:
1. ✅ Go to [vultr.com](https://vultr.com) and sign up
2. ✅ Click **"Deploy New Instance"**
3. ✅ Select:
   - **Type**: Cloud Compute
   - **OS**: Ubuntu 22.04 LTS
   - **Size**: $2.50/month (512MB RAM)
   - **Location**: Closest to your users
4. ✅ Click **"Deploy Now"**
5. ✅ **IMPORTANT**: Copy your **IPv4 address** from dashboard
   - You'll need this! Example: `192.168.1.100`

**⏱️ Wait 1-2 minutes for server to boot**

---

## 💻 STEP 2: Setup Docker on Vultr Server (10 min)

### Open Terminal and connect to Vultr:
```bash
ssh root@YOUR_VULTR_IP
# (paste password from Vultr email when prompted)
```

### Run these commands in your Vultr terminal:

```bash
# Update and install Docker
apt update && apt upgrade -y
apt install -y docker.io docker-compose git
systemctl start docker
systemctl enable docker

# Clone your repo
cd ~
git clone https://github.com/asasdfgd/PEPETOR-MINER.git
cd PEPETOR-MINER/apps/api

# Generate secure JWT secret (save this!)
openssl rand -base64 32
```

**This outputs something like:** `abc123xyz456...` - **COPY THIS**

### Build & Run Docker:
```bash
# Build image
docker build -t pepetor-api:latest .

# Start container (replace YOUR_JWT_SECRET with the output above)
docker run -d \
  --name pepetor-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e MONGODB_URI="mongodb+srv://Clearnetmoney:Gabby123!@clearnetlabs.tujf12x.mongodb.net/?appName=clearnetlabs" \
  -e CORS_ORIGIN="https://clearnetlabs.fun" \
  -e JWT_SECRET="YOUR_JWT_SECRET" \
  -v /data/pepetor:/app/data \
  pepetor-api:latest
```

### Test it works:
```bash
curl http://localhost:3001/api/health
```

Should show:
```json
{"success":true,"status":"Server is running",...}
```

✅ **SUCCESS!** Now run: `exit` to close SSH

---

## 🎨 STEP 3: Deploy Frontend to Vercel (5 min)

### Go to [vercel.com](https://vercel.com)
1. ✅ Sign up with GitHub
2. ✅ Click **"Add New"** → **"Project"**
3. ✅ Select your `PEPETOR-MINER` repo
4. ✅ In settings:
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build**: `npm run build`
   - **Output**: `dist`

5. ✅ Click **"Environment Variables"** and add:
   ```
   VITE_API_BASE_URL=http://YOUR_VULTR_IP:3001/api
   ```
   (Example: `http://192.168.1.100:3001/api`)

6. ✅ Click **"Deploy"**

**⏱️ Wait 1-2 minutes for build**

✅ **You get a Vercel URL** (e.g., `https://pepetor-miner.vercel.app`)

---

## 🌐 STEP 4: Connect Your Domain (30-60 min)

### In Vercel:
1. ✅ Go to project → **Settings** → **Domains**
2. ✅ Click **"Add Domain"**
3. ✅ Enter: `clearnetlabs.fun`
4. ✅ Vercel shows DNS instructions

### At Your Domain Registrar (GoDaddy, Namecheap, etc.):
1. ✅ Find **DNS Management**
2. ✅ Add CNAME record:
   - **Type**: CNAME
   - **Name**: `@`
   - **Value**: `cname.vercel.com`
3. ✅ Save

### Wait for DNS (10-60 min):
```bash
# Check status:
nslookup clearnetlabs.fun
# Should show Vercel's IPs
```

---

## 🎉 STEP 5: Test Everything (5 min)

### In Browser:
1. ✅ Visit `https://clearnetlabs.fun`
   - Should show your homepage
2. ✅ Click **"Extension"** page
   - Should load
3. ✅ Click **"FAQ"** page
   - Accordion should work
4. ✅ **Sign up** with email
   - Should work
5. ✅ **Login**
   - Should work
6. ✅ **Dashboard** loads data
   - Check browser DevTools → Network tab
   - API calls should show `200 OK`

### If you see CORS errors:
- Wait for domain DNS to fully propagate (can take 60 min)
- Or restart Docker container:
  ```bash
  ssh root@YOUR_VULTR_IP
  docker restart pepetor-api
  exit
  ```

---

## 🎯 Summary

| Step | Task | Time | Status |
|------|------|------|--------|
| 0 | Push code to GitHub | 2 min | ⬜ |
| 1 | Create Vultr server | 5 min | ⬜ |
| 2 | Setup Docker & deploy backend | 10 min | ⬜ |
| 3 | Deploy frontend to Vercel | 5 min | ⬜ |
| 4 | Connect domain | 30-60 min | ⬜ |
| 5 | Test everything | 5 min | ⬜ |

**Total: 55-85 minutes**

---

## 🆘 Need Help?

### Backend not responding:
```bash
ssh root@YOUR_VULTR_IP
docker logs pepetor-api -f
```

### Frontend won't build in Vercel:
- Check Vercel **Deployments** tab for error messages
- Usually missing environment variable

### DNS not propagating:
- Takes 10-60 minutes normally
- Use `nslookup clearnetlabs.fun` to check status

---

## ✨ You're Ready!

Ready to start? Begin with **STEP 0** above. Let me know when you hit any issues! 🚀