console.log('🚀 [APP START] Loading Express modules...');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 [APP START] Loading custom modules...');
const { connectDB, disconnectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const torRoutes = require('./routes/torRoutes');
const { authenticate } = require('./middleware/authMiddleware');

console.log('🚀 [APP START] All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Mount user routes (protected)
app.use('/api/users', authenticate, userRoutes);

// Mount session routes (public - signature verification is done in controller)
app.use('/api/sessions', sessionRoutes);

// Mount Tor management routes (public)
app.use('/api/tor', torRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// 404 handler
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

    // Connect to MongoDB (non-blocking)
    const dbConnection = await connectDB();
    if (dbConnection) {
      console.log('📊 Database connected and ready');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Backend server is running on port ${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`👥 Users Endpoint: http://localhost:${PORT}/api/users\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Shutting down server gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⏹️  Shutting down server gracefully...');
  await disconnectDB();
  process.exit(0);
});

// Start the server
startServer();
