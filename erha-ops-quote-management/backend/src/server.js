/**
 * ERHA OPS Quote Management API Server
 * Enhanced with Quality Cost Integration & Safety Assessment
 * Version: 7.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');

// Import routes
const quoteRoutes = require('./routes/quotes');
const qualityRoutes = require('./routes/quality');
const safetyRoutes = require('./routes/safety');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'quote-management-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger(logger));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ERHA OPS Quote Management API',
    version: '7.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Information
app.get('/api', (req, res) => {
  res.json({
    name: 'ERHA OPS Quote Management API',
    version: '7.0.0',
    description: 'Quote Management with Quality Cost Integration & Safety Assessment',
    features: [
      'Quote Lifecycle Management',
      'Quality Cost Integration',
      'Safety Risk Assessment',
      'Multi-level Approval Workflows',
      'Real-time Analytics',
      'ISO 9001 Compliance Tracking'
    ],
    endpoints: {
      quotes: '/api/quotes',
      quality: '/api/quality',
      safety: '/api/safety',
      analytics: '/api/analytics',
      auth: '/api/auth'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotes', authMiddleware, quoteRoutes);
app.use('/api/quality', authMiddleware, qualityRoutes);
app.use('/api/safety', authMiddleware, safetyRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(errorHandler(logger));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: \The route \ does not exist on this server\,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'POST /api/auth/login',
      'GET /api/quotes',
      'POST /api/quotes',
      'GET /api/quality/metrics',
      'GET /api/safety/assessment',
      'GET /api/analytics/dashboard'
    ]
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(\?? ERHA OPS Quote Management API v7.0 running on port \\);
  logger.info(\?? Enhanced with Quality Cost Integration & Safety Assessment\);
  logger.info(\?? Environment: \\);
  logger.info(\?? Health check: http://localhost:\/health\);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
