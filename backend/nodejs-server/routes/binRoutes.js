// Import required modules
const express = require('express');
const BinsController = require('../controllers/binControllers');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const BinsRateLimiter = require('../middlewares/binsRateLimiter');
const { errorHandlerMiddleware } = require('../middlewares/errorHandlers');

// Bin management routes
router.get('/list',
    BinsRateLimiter.getBinsLimiter,
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

// Route to get all bins under the supervisor's assigned bin locations
router.get('/supervisor/assigned-bins',
    BinsRateLimiter.getBinsBySupervisorAssignedLocationsLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager', 'Supervisor'),  // Adjust role if needed
    (req, res, next) => {
        logger.info(`Fetching all bins for supervisor with employeeId: ${req.query.employeeId}`);
        BinsController.getBinsBySupervisorAssignedLocations(req, res, next);
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
router.use(errorHandlerMiddleware);

module.exports = router;