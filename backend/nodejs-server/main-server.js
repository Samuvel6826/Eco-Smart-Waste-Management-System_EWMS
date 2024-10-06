require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const { logger: customLogger } = require('./utils/logger');
const { checkDeviceStatus, cleanupTracker } = require('./utils/deviceMonitoring');
const initializeFirebase = require('./config/firebaseConfig');

// Initialize Firebase
initializeFirebase();

// Importing Routes
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/usersRoutes');
const binsRouter = require('./routes/binsRoutes');
const connectToDatabase = require('./config/mongoDBconfig');

// Initialize Express app
const app = express();

// Check required environment variables
const requiredEnvVars = ['FIREBASE_DATABASE_URL', 'CORS_ORIGINS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    customLogger.error(`${envVar} is not set in the environment variables.`);
    process.exit(1);
  }
}

// Parse the CORS_ORIGINS from the environment variable
const corsOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());

// Log the allowed origins for debugging
customLogger.info("CORS_ORIGINS:", corsOrigins);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enable trust proxy
app.set('trust proxy', 1);

// Define Routes
app.use('/api', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/bin', binsRouter);

// 404 Error Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Log the error
  customLogger.error('Unhandled Error:', err);

  // Send error response
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status
    }
  });
});

// Monitoring Configuration
const MONITORING_CONFIG = {
  offlineThreshold: 20000, // Mark as offline after 20 seconds
};

// Start monitoring intervals
const MONITORING_INTERVAL = 10000; // 10 seconds
const CLEANUP_INTERVAL = 3600000; // 1 hour
setInterval(() => checkDeviceStatus(MONITORING_CONFIG), MONITORING_INTERVAL);
setInterval(() => cleanupTracker(MONITORING_CONFIG), CLEANUP_INTERVAL);

// Call the function to connect to the database
connectToDatabase();

// Export the app module
module.exports = app;