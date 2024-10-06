// Import required modules
const express = require('express');
const BinsController = require('../controllers/binsController');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const {
    createBinLimiter,
    sensorDistanceLimiter,
    heartbeatLimiter,
    getBinsLimiter,
    getBinByIdLimiter,
    editBinLimiter,
    deleteBinLimiter
} = require('../middlewares/rateLimiter');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred. Please try again later.';

    res.status(status).json({
        message,
        error: {
            code: status,
            detail: message
        }
    });
};

// Bin-related routes with rate limiting
router.post('/create', createBinLimiter, (req, res, next) => {
    logger.info('Creating a new bin');
    BinsController.createBin(req, res, next);
});

router.patch('/sensor-distance', sensorDistanceLimiter, (req, res, next) => {
    logger.info(`Updating sensor distance for bin: ${req.body.id} at location: ${req.body.binLocation}`);
    BinsController.updateSensorDistance(req, res, next);
});

router.patch('/sensor-heartbeat', heartbeatLimiter, (req, res, next) => {
    logger.info(`Updating heartbeat for bin: ${req.body.id} at location: ${req.body.binLocation}`);
    BinsController.updateHeartbeat(req, res, next);
});

router.get('/list', getBinsLimiter, (req, res, next) => {
    logger.info('Fetching all bins');
    BinsController.getBins(req, res, next);
});

router.get('/', getBinByIdLimiter, (req, res, next) => {
    const { location, id } = req.query;
    logger.info(`Fetching bin with ID: ${id} at location: ${location}`);
    BinsController.getBinByLocationAndId(req, res, next);
});

router.put('/edit', editBinLimiter, (req, res, next) => {
    const { location, id } = req.query;
    logger.info(`Editing bin with ID: ${id} at location: ${location}`);
    BinsController.editBinByLocationAndId(req, res, next);
});

router.delete('/delete', deleteBinLimiter, (req, res, next) => {
    const { location, id } = req.query;
    logger.info(`Deleting bin with ID: ${id} at location: ${location}`);
    BinsController.deleteBinByLocationAndId(req, res, next);
});

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;