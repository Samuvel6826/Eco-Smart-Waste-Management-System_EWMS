// middleware/errorHandler.js
const { logger } = require('../utils/logger');

// Error handler functions
const handleClientError = (res, message, statusCode = 400) => {
    logger.error(`Client Error: ${message}`);
    res.status(statusCode).json({
        status: 'fail',
        message,
    });
};

const handleServerError = (res, error) => {
    logger.error('Server Error:', error);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

const handleNotFoundError = (res, message = 'Resource not found') => {
    logger.error(`Not Found Error: ${message}`);
    res.status(404).json({
        status: 'fail',
        message
    });
};

const handleDuplicateError = (res, message) => {
    logger.error(`Duplicate Error: ${message}`);
    res.status(409).json({
        status: 'fail',
        message
    });
};

// Main error handler middleware
const errorHandlerMiddleware = (err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query
    });

    // Handle validation errors (e.g., from Joi)
    if (err.isJoi) {
        return handleClientError(res, err.details.map(detail => detail.message).join(', '));
    }

    // Handle Firebase errors
    if (err.code && err.code.startsWith('auth/')) {
        return handleClientError(res, 'Authentication failed', 401);
    }

    // Default to server error
    handleServerError(res, err);
};

module.exports = {
    handleClientError,
    handleServerError,
    handleNotFoundError,
    handleDuplicateError,
    errorHandlerMiddleware
};