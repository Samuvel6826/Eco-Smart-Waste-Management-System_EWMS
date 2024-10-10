const express = require('express');
const UsersController = require('../controllers/usersController');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const UsersRateLimiter = require('../middlewares/usersRateLimiter');

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

// User management routes
router.get('/list',
    // UsersRateLimiter.getAllUsersLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info('Fetching all users');
        UsersController.getAllUsers(req, res, next);
    }
);

// Get user by employeeId
router.get('/get/employeeId',
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

router.put('/edit/employeeId',
    UsersRateLimiter.editUserLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Editing user with employeeId: ${req.query.employeeId}`);
        UsersController.editUserByEmployeeId(req, res, next);
    }
);

router.delete('/delete/employeeId',
    UsersRateLimiter.deleteUserLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Deleting user with employeeId: ${req.query.employeeId}`);
        UsersController.deleteUserByEmployeeId(req, res, next);
    }
);

router.patch('/assign-binlocations/employeeId',
    UsersRateLimiter.assignBinsLimiter,
    auth.validate,
    auth.roleGuard('Admin', 'Manager'),
    (req, res, next) => {
        logger.info(`Assigning bins to user with employeeId: ${req.query.employeeId}`);
        UsersController.assignBinsByEmployeeId(req, res, next);
    }
);

// Authentication routes
router.post('/login',
    UsersRateLimiter.loginLimiter,
    (req, res, next) => {
        logger.info(`User login attempt: ${req.body.email}`);
        UsersController.loginUser(req, res, next);
    }
);

router.put('/change-password/employeeId',
    UsersRateLimiter.changePasswordLimiter,
    auth.validate,
    auth.roleGuard('Admin'),
    (req, res, next) => {
        logger.info(`Changing password for user with employeeId: ${req.query.employeeId}`);
        UsersController.changePassword(req, res, next);
    }
);

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;