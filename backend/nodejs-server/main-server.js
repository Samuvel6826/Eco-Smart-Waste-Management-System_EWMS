require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const { logger: customLogger } = require('./utils/logger');
const { startMonitoring, MONITORING_CONFIG, debugStatusCheck } = require('./utils/deviceMonitoring');
const initializeFirebase = require('./config/firebaseConfig');

// Initialize Firebase
initializeFirebase();

// Start the monitoring process
// startMonitoring();

// If you need to access or modify the config:
// console.log(MONITORING_CONFIG.offlineThreshold);

// Importing Routes
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/usersRoutes');
const binsRouter = require('./routes/binsRoutes');
const connectToDatabase = require('./config/mongoDBconfig');

// Initialize Express app
const app = express();

// Check required environment variables
const requiredEnvVars = ['FIREBASE_DATABASE_URL', 'CORS_ORIGINS', /* other required vars */];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  customLogger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
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

  // Set default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prepare the error response
  const errorResponse = {
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    message: message
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
});


// Call the function to connect to the database
connectToDatabase();

// Export the app module
module.exports = app;