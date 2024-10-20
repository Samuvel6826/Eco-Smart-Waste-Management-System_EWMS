// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const { logger } = require('./utils/logger');
const initializeFirebase = require('./config/firebaseConfig');
const connectToDatabase = require('./config/mongoDBconfig');

// Import route handlers
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/usersRoutes');
const binsRouter = require('./routes/binsRoutes');

// Initialize Express app
const app = express();

// Check required environment variables
const requiredEnvVars = ['FIREBASE_DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Initialize Firebase
initializeFirebase();

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://eco-smart-waste-management-system-pkc.netlify.app"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: [
    'https://eco-smart-waste-management-system-pkc.netlify.app',
    'http://localhost:5173'  // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable trust proxy
app.set('trust proxy', 1);

// Serve static files
app.use(express.static('public'));

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
  logger.error('Unhandled Error:', {
    error: err,
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse = {
    status: statusCode < 500 ? 'fail' : 'error',
    message: message
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Connect to the database
connectToDatabase();

module.exports = app;