require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const { logger: customLogger } = require('./utils/logger');
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
const requiredEnvVars = ['FIREBASE_DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  customLogger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://eco-smart-waste-management-system-pkc.netlify.app"],
    },
  },
}));

const allowedOrigins = ['https://eco-smart-waste-management-system-pkc.netlify.app', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

// Detailed request logging
app.use((req, res, next) => {
  customLogger.info(`Incoming request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// 404 Error Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  customLogger.error('Unhandled Error:', {
    error: err,
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  const errorResponse = {
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    message: message
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Call the function to connect to the database
connectToDatabase();

// Export the app module
module.exports = app;