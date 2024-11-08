const express = require('express');
const UsersController = require('../controllers/usersController');
const NotificationController = require('../controllers/notificationController');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const UsersRateLimiter = require('../middlewares/usersRateLimiter');
const { errorHandlerMiddleware } = require('../middlewares/errorHandlers');

// User management routes
router.get('/list',
    UsersRateLimiter.getAllUsersLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info('Fetching all users');
        UsersController.getAllUsers(req, res, next);
    }
);

// Get user by employeeId
router.get('/get',
    UsersRateLimiter.getUserByIdLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Fetching user with employeeId: ${req.query.employeeId}`);
        UsersController.getUserByEmployeeId(req, res, next);
    }
);

router.post('/create',
    UsersRateLimiter.createUserLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager', 'Technician'),
    (req, res, next) => {
        logger.info('Creating a new user');
        UsersController.createUser(req, res, next);
    }
);

router.put('/edit',
    UsersRateLimiter.editUserLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Editing user with employeeId: ${req.query.employeeId}`);
        UsersController.editUserByEmployeeId(req, res, next);
    }
);

// Route to get assigned bin locations for a specific employee
router.get('/employee/assigned-bin-locations',
    UsersRateLimiter.assignBinsByEmployeeIdLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager', 'Supervisor'),  // Adjust role if needed
    (req, res, next) => {
        logger.info(`Fetching assigned bin locations for employeeId: ${req.query.employeeId}`);
        UsersController.getAssignedBinLocations(req, res, next);
    }
);

router.delete('/delete',
    UsersRateLimiter.deleteUserLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Deleting user with employeeId: ${req.query.employeeId}`);
        UsersController.deleteUserByEmployeeId(req, res, next);
    }
);

router.post('/assign-binlocations',
    UsersRateLimiter.assignBinsLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager', 'Supervisor'),
    (req, res, next) => {
        UsersController.assignBinsBySupervisorId(req, res, next);
    }
);

// Authentication routes
router.post('/login',
    (req, res, next) => {
        logger.info(`User login attempt: ${req.body.email}`);
        UsersController.loginUser(req, res, next);
    }
);

router.put('/change-password',
    UsersRateLimiter.changePasswordLimiter,
    auth.validate,
    auth.roleGuard('Admin'),
    (req, res, next) => {
        logger.info(`Changing password for user with employeeId: ${req.query.employeeId}`);
        UsersController.changePassword(req, res, next);
    }
);

router.post('/notification-send',
    auth.validate,
    NotificationController.sendFirebaseNotification
);

// Apply error handling middleware
router.use(errorHandlerMiddleware);

module.exports = router;