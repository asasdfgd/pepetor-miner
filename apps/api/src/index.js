console.log('🚀 [APP START] Loading Express modules...');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Debug environment
console.log('🔍 [ENVIRONMENT CHECK]');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || '8080 (default)');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? 'set (*****)' : 'not set');
console.log('  CORS_ORIGIN:', process.env.CORS_ORIGIN || 'not set');

console.log('🚀 [APP START] Loading custom modules...');
const { connectDB, disconnectDB } = require('./config/database');
const miningService = require('./services/miningService');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const torRoutes = require('./routes/torRoutes');
const tokenDeploymentRoutes = require('./routes/tokenDeploymentRoutes');
const bondingCurveRoutes = require('./routes/bondingCurveRoutes');
const liquidityCommitmentRoutes = require('./routes/liquidityCommitmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const miningRoutes = require('./routes/miningRoutes');
const { authenticate } = require('./middleware/authMiddleware');

console.log('🚀 [APP START] All modules loaded successfully');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.clearnetlabs.fun',
  'https://pepetor-miner.fly.dev',
  'https://clearnetlabs.fun',
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

// --- API ROUTES --- (MOVED UP)
// All API routes must be registered before the static file server and catch-all route
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
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
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PEPETOR-MINER API Server',
    version: '1.0.0',
  });
});

// Mount all other API routes
apiRouter.use('/mining', miningRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/tor', torRoutes);
apiRouter.use('/token-deployment', tokenDeploymentRoutes);
apiRouter.use('/bonding-curve', bondingCurveRoutes);
apiRouter.use('/liquidity-commitment', liquidityCommitmentRoutes);

// Register the main API router
app.use('/api', apiRouter);

// --- STATIC FRONTEND & CATCH-ALL --- (MUST BE LAST)

// Serve static files from frontend dist
const path = require('path');
const fs = require('fs');
const frontendDistPath = path.resolve(process.cwd(), 'apps/web/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  console.log('✅ Serving static files from:', frontendDistPath);
}

// Catch-all route: serves index.html for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Frontend not found. API is running, but no frontend build is available.',
    });
  }
});

// Error handling middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Server startup
const startServer = async () => {
  try {
    console.log('🚀 Starting PEPETOR-MINER Backend Server...\n');
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📌 Port: ${PORT}`);

    await connectDB();
    
    const SystemSettings = require('./models/SystemSettings');
    await SystemSettings.initializeDefaults();
    console.log('⚙️  System settings initialized');
    
    const migrationMonitor = require('./services/migrationMonitorService');
    await migrationMonitor.start();

    await miningService.connect();

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
    });
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Backend server is running on 0.0.0.0:${PORT}`);
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

// Graceful shutdown logic...

startServer();