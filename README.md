# PEPETOR-MINER 🚀

**Privacy-first distributed mining platform** with Tor support, Solana blockchain integration, and Chrome browser extension for anonymous cryptocurrency operations.

## 📦 Monorepo Structure

```
PEPETOR-MINER/
├── apps/
│   ├── api/                 # Express.js REST API (Node.js)
│   │   ├── src/
│   │   │   ├── config/      # Database & environment config
│   │   │   ├── controllers/ # Business logic
│   │   │   ├── models/      # MongoDB schemas
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middleware/  # Auth, logging, CORS
│   │   │   ├── services/    # External integrations
│   │   │   └── utils/       # Helpers & utilities
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── web/                 # React + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page-level components
│   │   │   ├── services/    # API client
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── context/     # Global state
│   │   │   ├── styles/      # CSS styling
│   │   │   └── utils/       # Helpers
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── chrome-extension/    # Chromium-based browser extension
│   │   ├── manifest.json    # Extension metadata
│   │   ├── background.js    # Service worker
│   │   ├── content.js       # Page injection
│   │   ├── popup.html/js    # Extension popup
│   │   ├── options.html/js  # Settings page
│   │   └── services/        # Chrome APIs
│   │
│   └── tor-backend/         # FastAPI Tor privacy backend (Python)
│       ├── main.py          # Tor-protected endpoints
│       └── server.py        # Server configuration
│
├── packages/
│   └── sdk/                 # Shared SDK (placeholder for shared code)
│       ├── src/
│       └── package.json
│
├── programs/
│   └── factory/             # Anchor.js Solana contracts (placeholder)
│       └── programs/
│
├── tokenomics/              # Token economics configs
│
├── scripts/                 # Build & deployment automation
│   ├── dev.sh              # Start dev servers
│   ├── dev-simple.sh       # Simple dev startup
│   ├── test-backend.sh     # Test runner
│   └── ...
│
├── config/                  # Shared configuration files
│
├── docs/                    # Documentation & guides
│
├── .env.example             # Environment template
├── package.json             # Monorepo workspace config
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **MongoDB** (local or MongoDB Atlas)

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/asasdfgd/pepetor-miner.git
cd PEPETOR-MINER

# 2. Install all workspaces
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Running Applications

**Terminal 1 - Backend API:**
```bash
npm run dev:api
# API runs on http://localhost:3001
```

**Terminal 2 - Frontend Web:**
```bash
npm run dev:web
# Frontend runs on http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev              # Run all apps in development
npm run dev:api         # Backend only
npm run dev:web         # Frontend only

# Production Build
npm run build            # Build all apps
npm run build:api       # Backend build
npm run build:web       # Frontend build

# Testing & Linting
npm test                # Run tests across workspaces
npm run lint            # Lint all code

# Cleanup
npm run clean           # Remove node_modules & build artifacts
npm install-all         # Fresh install
```

## 🏗️ Backend (API)

**Location**: `apps/api/`

- **Framework**: Express.js 4.18.2
- **Database**: MongoDB (via Mongoose)
- **Port**: 3001
- **Authentication**: JWT (configurable)

### Database Models
- **User**: Username, email, password, profile info, role, activity tracking
- **Session**: User sessions for API authentication
- **Mining Data**: Distributed mining records & rewards

### API Endpoints
```
GET    /api/users              # List all users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user

GET    /api/mining/stats       # Mining statistics
GET    /api/mining/rewards     # User rewards
POST   /api/mining/submit      # Submit mining work
```

### Environment Variables
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pepetor-miner
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

## 🎨 Frontend (Web)

**Location**: `apps/web/`

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Router**: React Router 6
- **HTTP Client**: Axios
- **Port**: 3000

### Key Features
- User authentication dashboard
- Mining statistics & rewards tracking
- Real-time notifications
- Responsive design (mobile-friendly)

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 🔌 Chrome Extension

**Location**: `apps/chrome-extension/`

- **Manifest Version**: MV3 (Manifest V3)
- **Key Files**:
  - `manifest.json` - Extension metadata
  - `background.js` - Service worker
  - `popup.html` - Extension popup UI
  - `options.html` - Settings page

### Features
- Background mining support
- Real-time earnings tracking
- Privacy-focused operations
- Easy enable/disable toggle

## 🔐 Privacy Backend (Tor)

**Location**: `apps/tor-backend/`

- **Framework**: FastAPI (Python)
- **Purpose**: Privacy-protected operations via Tor network
- **Features**: 
  - Tor hidden service support
  - IPFS gateway integration
  - Cryptographic session management

## 📦 Shared Packages

### SDK (`packages/sdk/`)
Placeholder for shared utilities & types across applications:
- Common interfaces
- API client configuration
- Shared utilities

### Solana Programs (`programs/factory/`)
Anchor.js smart contracts for Solana blockchain:
- Token factory
- Reward distribution
- Mining pool contracts

## 🔧 Configuration

### Environment Templates
- `.env.example` - Root environment template
- `apps/api/.env` - Backend configuration
- `apps/web/.env` - Frontend configuration

### Database Setup

**Local MongoDB**:
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community
```

**MongoDB Atlas Cloud**:
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and copy connection string
3. Add to `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pepetor-miner`

## 🚢 Deployment

### Build Production Bundles
```bash
npm run build
```

### Backend Deployment
```bash
cd apps/api
npm install --production
npm start
```

### Frontend Deployment (Vercel)
```bash
# Vercel automatically detects Next.js/Vite apps
# Just push to GitHub and connect to Vercel dashboard
# Frontend builds to: apps/web/dist/
```

### Chrome Extension Deployment
```bash
# Package extension for submission to Chrome Web Store
# Submit built extension to: https://chrome.google.com/webstore/
```

## 📚 Documentation

- **[Database Integration](./DATABASE_INTEGRATION.md)** - MongoDB setup & schemas
- **[Authentication](./AUTH_IMPLEMENTATION.md)** - JWT implementation
- **[Extension Setup](./EXTENSION_SETUP_GUIDE.md)** - Chrome extension development
- **[Deployment Guide](./PHASE4B_DEPLOYMENT_GUIDE.md)** - Production deployment

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

**Frontend not connecting to API?**
```bash
# Check VITE_API_BASE_URL in apps/web/.env
# Ensure backend is running on http://localhost:3001
```

**MongoDB connection error?**
```bash
# Verify MONGODB_URI in apps/api/.env
# Check MongoDB is running: brew services list
```

**npm workspace issues?**
```bash
# Clear cache and reinstall
npm run clean
npm install
```

## 📋 Project Status

- ✅ **Complete**: Monorepo structure with 3 apps
- ✅ **Complete**: Backend API (Express + MongoDB)
- ✅ **Complete**: Frontend (React + Vite)
- ✅ **In Progress**: Chrome extension functionality
- ⏳ **Pending**: Solana integration & deployment

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👤 Author

**Joseph Pietravalle**  
GitHub: [@asasdfgd](https://github.com/asasdfgd)

---

**🌐 Privacy First | 🚀 Always** | Built with ❤️