---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
PEPETOR-MINER is a privacy-first distributed mining platform with Tor support, Solana blockchain integration, and Chrome browser extension. It's organized as an npm monorepo with Node.js 20.18.0 backend, React 18.2.0 frontend, and supporting services including a Python Tor privacy backend.

## Repository Structure

The monorepo contains multiple applications under `apps/` directory with shared configuration at the root level:

### Main Repository Components
- **apps/api**: Express.js REST API backend server (Node.js)
- **apps/web**: React + Vite frontend application
- **apps/chrome-extension**: Chromium MV3 browser extension
- **apps/tor-backend**: FastAPI Python privacy backend (Tor support)
- **packages/sdk**: Placeholder for shared SDK utilities
- **scripts/**: Build and deployment automation scripts

## Projects

### Backend API (apps/api)
**Configuration File**: `apps/api/package.json`

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js 20.18.0 (specified in Dockerfile), npm ≥ 9.0.0
**Build System**: npm
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express 4.18.2 (REST framework)
- mongoose 8.19.2 (MongoDB ODM)
- @solana/web3.js 1.87.0 (Solana blockchain)
- @solana/spl-token 0.1.8 (SPL tokens)
- jsonwebtoken 9.0.2 (JWT authentication)
- bcryptjs 2.4.3 (Password hashing)
- socket.io 4.7.2 (Real-time communication)
- cors 2.8.5 (CORS middleware)
- dotenv 16.3.1 (Environment configuration)
- tweetnacl 1.0.3 (Cryptography)
- uuid 9.0.0 (UUID generation)

#### Build & Installation
```bash
npm install
npm run build
npm start
```

#### Docker
**Dockerfile**: `apps/api/Dockerfile`
**Image**: node:20.18.0-slim
**Configuration**: 
- Installs build-essential and python3 dependencies
- Copies monorepo package files for workspace resolution
- Runs `npm ci --prefer-offline --no-audit`
- Sets NODE_ENV=production
- Exposes port 3001

#### Testing
**Framework**: Jest
**Run Command**:
```bash
npm test
npm test -- --coverage
```

#### Main Files
**Entry Point**: `apps/api/src/index.js`
**Structure**:
- `src/controllers/` - Business logic
- `src/routes/` - API endpoints
- `src/models/` - MongoDB schemas
- `src/services/` - External integrations
- `src/middleware/` - Auth, logging, CORS

### Frontend Web (apps/web)
**Configuration File**: `apps/web/package.json`

#### Language & Runtime
**Language**: JavaScript/React
**Version**: React 18.2.0, Vite 7.1.12, Node.js ≥ 18.0.0
**Build System**: Vite
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react 18.2.0 (UI framework)
- react-dom 18.2.0 (React DOM)
- react-router-dom 6.20.0 (Client-side routing)
- axios 1.6.2 (HTTP client)
- tweetnacl 1.0.3 (Cryptography)

**Development Dependencies**:
- vite 7.1.12 (Build tool and dev server)
- @vitejs/plugin-react 4.2.0 (React plugin)
- eslint (Linting)

#### Build & Installation
```bash
npm install
npm run dev
npm run build
npm run preview
```

#### Main Files
**Entry Point**: `index.html` (Vite entry point)
**Output Directory**: `dist-new/` (configured in vite.config.js)
**Vite Config**: `vite.config.js`
- Dev server on port 3000
- Proxy to backend API at /api → http://localhost:3001
- Output builds to dist-new directory

### Chrome Extension (apps/chrome-extension)
**Type**: Chromium MV3 Browser Extension

**Main Files**:
- `manifest.json` - Extension metadata
- `background.js` - Service worker (8.65 KB)
- `popup.html/js` - Extension popup UI
- `options.html/js` - Settings page
- `content.js` - Page content injection

**Structure**: Plain JavaScript/HTML (no build system) - copies directly to extension ID

### Python Tor Backend (apps/tor-backend)
**Type**: FastAPI Python Application

**Main Files**:
- `main.py` - Tor-protected endpoints
- `server.py` - Server configuration
**Dependencies**: Python 3.x, FastAPI

### Root Configuration
**Configuration File**: `package.json` (monorepo config)

#### Version Info
**Version**: 2.0.1
**Node**: ≥18.0.0
**npm**: ≥9.0.0

#### Workspaces
```
apps/api
apps/web
apps/chrome-extension
apps/tor-backend
packages/sdk
```

#### Root Scripts
```bash
npm run dev              # Run all apps in development
npm run dev:api         # Backend only
npm run dev:web         # Frontend only
npm run build            # Build all apps
npm run build:api       # Backend build
npm run build:web       # Frontend build
npm test                # Run tests across workspaces
npm run lint            # Lint all code
npm run clean           # Remove node_modules & build artifacts
```

## Deployment

### Vercel (Frontend)
- Detects monorepo and builds `apps/web`
- Automatically runs `npm run build`
- Builds to `dist-new/` directory

### Fly.io (Backend)
**Configuration**: `fly.toml`
- Uses `apps/api/Dockerfile`
- Primary region: `ord` (Chicago)
- Port: 3001 (internal), 80/443 (external)
- Health check: GET `/api/health`

## Git Configuration
**Repository**: https://github.com/asasdfgd/pepetor-miner.git
**Author**: Giuseppe Pietravalle (qeradad2@gmail.com)
**Main Branch**: main

## Known Build Issues
**Vercel Build Error**: Missing `@rollup/rollup-linux-x64-gnu` module - related to npm optional dependency bug (npm/cli#4828). Solution: Clean install of node_modules and package-lock.json.
