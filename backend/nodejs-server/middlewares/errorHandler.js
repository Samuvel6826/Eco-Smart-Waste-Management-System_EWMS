// middleware/errorHandler.js
const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error', details: err.message });
};