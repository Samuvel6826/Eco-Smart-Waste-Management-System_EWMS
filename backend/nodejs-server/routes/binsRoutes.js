// Import required modules
const express = require('express');
const BinsController = require('../controllers/binsController');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const BinsRateLimiter = require('../middlewares/binsRateLimiter');

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

// Bin management routes
router.get('/list',
    // BinsRateLimiter.getBinsLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info('Fetching all bins');
        BinsController.getBins(req, res, next);
    }
);

router.get('/getBinByLocationAndId',
    BinsRateLimiter.getBinByIdLimiter,
    auth.validate,
    (req, res, next) => {
        logger.info(`Fetching bin with location: ${req.query.location} and  ID: ${req.query.id}`);
        BinsController.getBinByLocationAndId(req, res, next);
    }
);

router.post('/create',
    BinsRateLimiter.createBinLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info('Creating a new bin');
        BinsController.createBin(req, res, next);
    }
);

router.put('/edit',
    BinsRateLimiter.editBinLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Editing bin with location: ${req.query.location} and  ID: ${req.query.id}`);
        BinsController.editBinByLocationAndId(req, res, next);
    }
);

router.delete('/delete',
    BinsRateLimiter.deleteBinLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Deleting bin with location: ${req.query.location} and  ID: ${req.query.id}`);
        BinsController.deleteBinByLocationAndId(req, res, next);
    }
);

router.patch('/sensor-distance',
    BinsRateLimiter.sensorDistanceLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Technician'),

    (req, res, next) => {
        logger.info(`Updating sensor distance for bin location: ${req.query.location} and ID: ${req.query.id}`);
        BinsController.updateSensorDistance(req, res, next);
    }
);

router.patch('/sensor-heartbeat',
    BinsRateLimiter.heartbeatLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Technician'),
    (req, res, next) => {
        logger.info(`Updating heartbeat for bin location: ${req.query.location} and ID: ${req.query.id}`);
        BinsController.updateHeartbeat(req, res, next);
    }
);

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;