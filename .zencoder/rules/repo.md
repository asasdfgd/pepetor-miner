---
description: Repository Information Overview
alwaysApply: true
---

# PEPETOR-MINER Repository Information

## Repository Summary

PEPETOR-MINER is a full-stack monorepo JavaScript application with three main components: Express.js backend API with MongoDB database, React frontend web application, and Chrome browser extension. All components share Node.js/npm as the runtime and package manager for seamless integration and code reuse.

## Repository Structure

```
PEPETOR-MINER/
├── backend/              # Express.js REST API Server with MongoDB
│   ├── src/
│   │   ├── index.js      # Server entry point
│   │   ├── config/       # Configuration (database connection)
│   │   ├── models/       # Data models (User.js)
│   │   ├── controllers/  # Business logic (userController.js)
│   │   ├── routes/       # API route handlers (userRoutes.js)
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Utilities
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/             # React Web Application
│   ├── src/
│   │   ├── main.jsx      # React entry point
│   │   ├── App.jsx       # Main component
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API client
│   │   ├── hooks/        # Custom hooks
│   │   ├── styles/       # CSS styling
│   │   └── utils/        # Utilities
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite build config
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── chrome-extension/     # Chrome Browser Extension (scaffolding)
├── config/               # Shared configuration
├── scripts/              # Build & deployment scripts
├── docs/                 # Documentation
├── .env.example          # Root environment template
└── .gitignore
```

## Backend (Express.js + MongoDB)

**Location**: `backend/`

### Language & Runtime
- **Language**: JavaScript (Node.js)
- **Runtime Version**: Node.js >= 18.0.0
- **Package Manager**: npm >= 9.0.0
- **Build System**: Node.js native (no build step needed)
- **Database**: MongoDB (local or MongoDB Atlas cloud)

### Dependencies
**Main**:
- `express` (4.18.2) - Web framework
- `cors` (2.8.5) - Cross-Origin Resource Sharing
- `dotenv` (16.3.1) - Environment configuration
- `mongoose` (8.19.2) - MongoDB ODM and schema validation

### Models & Endpoints
**User Model**: MongoDB schema with username, email, password, fullName, avatar, role, isActive, lastLogin fields
**User Endpoints**:
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Build & Installation
```bash
cd backend
npm install
npm start              # Production
npm run dev            # Development with auto-reload
```

### Configuration
- **Port**: 3001 (default)
- **Database**: MongoDB connection via MONGODB_URI environment variable
- **Local MongoDB**: mongodb://localhost:27017/pepetor-miner
- **Cloud MongoDB Atlas**: mongodb+srv://username:password@cluster.mongodb.net/pepetor-miner
- **CORS**: Enabled for frontend at http://localhost:3000

## Frontend (React + Vite)

**Location**: `frontend/`

### Language & Runtime
- **Language**: JavaScript (React 18)
- **Runtime Version**: Node.js >= 18.0.0
- **Package Manager**: npm >= 9.0.0
- **Build System**: Vite 5.0.8
- **Framework**: React 18.2.0 with React Router 6

### Dependencies
**Main**:
- `react` (18.2.0) - UI library
- `react-dom` (18.2.0) - React rendering
- `react-router-dom` (6.20.0) - Routing
- `axios` (1.6.2) - HTTP client

**Dev**:
- `vite` (5.0.8) - Build tool
- `@vitejs/plugin-react` (4.2.0) - React support

### Build & Installation
```bash
cd frontend
npm install
npm run dev            # Development server (http://localhost:3000)
npm run build          # Production build
npm run preview        # Preview production build
```

### Configuration
- **API Base URL**: Set in `.env` (default: http://localhost:3001/api)
- **Port**: 3000 (dev server)
- **Build Output**: `dist/` directory

## Development Workflow

### Start Development (Two Terminal Windows)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001 with MongoDB
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Frontend automatically connects to backend via API calls. Backend connects to MongoDB and provides user management endpoints.

## Database Setup

### Local MongoDB
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Verify
mongo
```

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string
3. Update backend `.env` with MongoDB Atlas connection string

## Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build  # Creates dist/ folder
```

### Backend Deployment
```bash
cd backend
npm start
# Ensure MONGODB_URI environment variable is set
```

## Environment Configuration

Both components use `.env` files. Template: `.env.example`

**Backend** (.env):
- `NODE_ENV` - development/production
- `PORT` - Server port
- `CORS_ORIGIN` - Frontend URL
- `MONGODB_URI` - MongoDB connection string

**Frontend** (.env):
- `VITE_API_BASE_URL` - Backend API URL

## Project Status

✅ **Complete**: Backend server with MongoDB database integration
✅ **Complete**: User model with CRUD endpoints
✅ **Complete**: React frontend with Vite, routing, API integration
🔄 **In Progress**: Chrome extension scaffolding
⏳ **Pending**: Authentication, feature implementation, deployment

## Next Steps

1. Implement authentication (JWT/OAuth) - Backend
2. Build feature-specific API endpoints - Backend
3. Create Chrome extension - Chrome Extension
4. Set up CI/CD pipeline
5. Deploy to staging/production environment
