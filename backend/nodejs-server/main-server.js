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
const userRouter = require('./routes/userRoutes');
const binRouter = require('./routes/binRoutes');
const pushNotificationRouter = require('./routes/pushNotificationRoutes');
const emailNotificationRouter = require('./routes/emailNotificationRoutes');

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
      "script-src": ["'self'", "https://eco-smart-waste-management-system.netlify.app"],
      "connect-src": ["'self'", "https://eco-smart-waste-management-system.netlify.app"],
      "frame-src": ["'self'", "https://eco-smart-waste-management-system.netlify.app"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://eco-smart-waste-management-system.netlify.app',
      'http://localhost:5173',
      // Add any other frontend origins you need
    ];

    // Check if origin is undefined (for same-origin requests) or in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// In your Express app:
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle pre-flight requests

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
app.use('/api/user', userRouter);
app.use('/api/bin', binRouter);
app.use('/api/pushNotification', pushNotificationRouter);
app.use('/api/emailNotification', emailNotificationRouter);

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