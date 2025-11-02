# ⚡ PEPETOR-MINER Quick Reference

## 🚀 Start Everything (One Command)

```bash
npm run dev
```

**That's it!** Both backend + frontend start in one terminal window.

---

## 📋 Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | **Start both backend + frontend** 🚀 |
| `npm run dev:backend` | Start just backend |
| `npm run dev:frontend` | Start just frontend |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style automatically |
| `npm test` | Run tests |

---

## 🎯 5-Minute Setup

```bash
# 1. One-time setup
npm run dev:setup

# 2. Setup traffic monitoring
bash scripts/setup-traffic-monitoring.sh

# 3. Start development
npm run dev

# 4. In browser: http://localhost:3000
# 5. Configure proxy to 127.0.0.1:9149
```

---

## 🔗 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | React App |
| Backend | http://localhost:3001 | Express API |
| Tor SOCKS5 | socks5://127.0.0.1:9149 | Proxy |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 📊 File Structure

```
Root (you are here)
├── package.json ← Run "npm run dev" from here
├── backend/
│   ├── src/index.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/main.jsx
│   ├── package.json
│   └── vite.config.js
├── chrome-extension/
│   ├── manifest.json
│   └── popup.html
└── scripts/
    ├── dev.sh
    ├── dev-simple.sh
    └── setup-traffic-monitoring.sh
```

---

## 🐛 Quick Fixes

**"Port 3000 in use?"**
```bash
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**"Port 3001 in use?"**
```bash
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**"npm install hanging?"**
```bash
npm cache clean --force
rm -rf package-lock.json node_modules
npm install
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **DEV_QUICK_START.md** | Complete dev setup guide |
| **TRAFFIC_MONITORING_README.md** | Traffic monitoring setup |
| **TRAFFIC_MONITORING_GUIDE.md** | Full traffic monitoring docs |
| **IMPLEMENTATION_CHECKLIST.md** | Testing checklist |

---

## 🎓 Workflow

```
npm run dev
    ↓
Backend starts on :3001 (blue output)
    ↓
Frontend starts on :3000 (magenta output)
    ↓
Both run in same terminal
    ↓
Press Ctrl+C to stop both
```

---

## 💡 Pro Tips

- **Colored output:** Blue = Backend, Magenta = Frontend
- **Separate logs:** Use `./scripts/dev.sh` to get log files at `/tmp/*.log`
- **Kill one service:** Press Ctrl+C in the service's original terminal tab
- **Watch files:** Both use file watchers (Node --watch, Vite)
- **No manual refresh:** Frontend hot-reloads automatically

---

**Start here:** `npm run dev` 🚀