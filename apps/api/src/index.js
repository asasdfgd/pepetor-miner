console.log('🚀 [APP START] Loading Express modules...');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Debug environment
console.log('🔍 [ENVIRONMENT CHECK]');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || '3001 (default)');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? 'set (*****)' : 'not set');
console.log('  CORS_ORIGIN:', process.env.CORS_ORIGIN || 'not set');

console.log('🚀 [APP START] Loading custom modules...');
const { connectDB, disconnectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const torRoutes = require('./routes/torRoutes');
const tokenDeploymentRoutes = require('./routes/tokenDeploymentRoutes');
const bondingCurveRoutes = require('./routes/bondingCurveRoutes');
const liquidityCommitmentRoutes = require('./routes/liquidityCommitmentRoutes');
const { authenticate } = require('./middleware/authMiddleware');

console.log('🚀 [APP START] All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://clearnetlabs.fun',
  'https://www.clearnetlabs.fun',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from frontend dist
const path = require('path');
const fs = require('fs');

// Resolve the frontend dist path - relative to current working directory
// In Docker, process.cwd() = /app, so apps/web/dist should exist
const frontendDistPath = path.resolve(process.cwd(), 'apps/web/dist');

// Check if dist folder exists
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  console.log('✅ Serving static files from:', frontendDistPath);
} else {
  console.warn('⚠️  Frontend dist not found at:', frontendDistPath);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      name: 'MongoDB',
    },
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PEPETOR-MINER API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout (requires Bearer token)',
      },
      users: {
        getAll: 'GET /api/users (requires Bearer token)',
        getById: 'GET /api/users/:id (requires Bearer token)',
        create: 'POST /api/users (requires Bearer token)',
        update: 'PUT /api/users/:id (requires Bearer token)',
        delete: 'DELETE /api/users/:id (requires Bearer token)',
      },
      sessions: {
        submit: 'POST /api/sessions/submit (public)',
        getBalance: 'GET /api/sessions/balance?pubkey=<key> (public)',
        getPolicy: 'GET /api/sessions/policy (public)',
        getSessionDetails: 'GET /api/sessions/:sessionId (public)',
        getUserSessions: 'GET /api/sessions/by-client/list?clientPub=<key> (public)',
      },
    },
  });
});

// Mount auth routes (public)
app.use('/api/auth', authRoutes);

// Mount user routes (public for directory)
app.use('/api/users', userRoutes);

// Mount session routes (public - signature verification is done in controller)
app.use('/api/sessions', sessionRoutes);

// Mount Tor management routes (public)
app.use('/api/tor', torRoutes);

// Mount token deployment routes
app.use('/api/token-deployment', tokenDeploymentRoutes);

// Mount bonding curve routes
app.use('/api/bonding-curve', bondingCurveRoutes);

// Mount liquidity commitment routes
app.use('/api/liquidity-commitment', liquidityCommitmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Catch-all route: serve index.html for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Failed to serve index.html:', err.message);
      res.status(404).json({
        success: false,
        message: 'Frontend not found',
        path: req.path,
      });
    }
  });
});

// 404 handler (API endpoints only)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Server startup
const startServer = async () => {
  try {
    console.log('🚀 Starting PEPETOR-MINER Backend Server...\n');
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📌 Port: ${PORT}`);

    // Connect to MongoDB (non-blocking)
    console.log('🔌 Attempting MongoDB connection...');
    const dbConnection = await connectDB();
    if (dbConnection) {
      console.log('📊 Database connected and ready');
      
      const migrationMonitor = require('./services/migrationMonitorService');
      await migrationMonitor.start();
    }

    // Start Express server on all interfaces for Docker/Fly.io compatibility
    console.log('🚀 Starting Express server...');
    const server = http.createServer(app);
    
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    global.io = io;

    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });

      socket.on('subscribe:users', () => {
        socket.join('users');
        console.log(`📡 Client ${socket.id} subscribed to users`);
      });

      socket.on('subscribe:tokens', () => {
        socket.join('tokens');
        console.log(`📡 Client ${socket.id} subscribed to tokens`);
      });
    });
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Backend server is running on 0.0.0.0:${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`👥 Users Endpoint: http://localhost:${PORT}/api/users`);
      console.log(`🔌 WebSocket server is running\n`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Shutting down server gracefully...');
  const migrationMonitor = require('./services/migrationMonitorService');
  await migrationMonitor.stop();
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⏹️  Shutting down server gracefully...');
  const migrationMonitor = require('./services/migrationMonitorService');
  await migrationMonitor.stop();
  await disconnectDB();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Start the server
startServer();
