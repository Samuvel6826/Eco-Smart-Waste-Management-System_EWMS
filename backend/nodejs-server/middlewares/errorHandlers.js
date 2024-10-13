// middleware/errorHandler.js
const { logger } = require('../utils/logger');

// General error handler middleware
const errorHandlerMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred. Please try again later.';

    logger.error('Error:', {
        status,
        message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
    });

    res.status(status).json({
        message,
        error: {
            code: status,
            detail: process.env.NODE_ENV === 'production' ? message : err.stack
        }
    });
};

// Helper function for client errors
const handleClientError = (res, message) => {
    logger.error(`Client Error: ${message}`);
    res.status(400).json({
        message,
        error: {
            code: 400,
            detail: message
        }
    });
};

// Helper function for server errors
const handleServerError = (res, error) => {
    logger.error('Server Error:', error.message);
    res.status(500).json({
        message: 'Internal Server Error',
        error: {
            code: 500,
            detail: error.message
        }
    });
};

module.exports = {
    errorHandlerMiddleware,
    handleClientError,
    handleServerError
};