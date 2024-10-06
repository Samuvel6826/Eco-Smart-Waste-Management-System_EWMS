const express = require('express');
const UsersController = require('../controllers/users');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger'); // Import custom logger

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`); // Replace console.error with logger.error
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

// Group user-related routes under /users

router.get('/list', auth.validate, auth.roleGuard('Admin', 'Manager'), (req, res, next) => {
    logger.info('Fetching all users'); // Log the request details
    UsersController.getUsers(req, res, next);
});

router.get('/:id', auth.validate, (req, res, next) => {
    logger.info(`Fetching user with ID: ${req.params.id}`);
    UsersController.getUserById(req, res, next);
}); // Authenticated access

router.post('/', (req, res, next) => {
    logger.info('Creating a new user'); // Log the request action
    UsersController.createUser(req, res, next);
}); // Create a new user

router.put('/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), (req, res, next) => {
    logger.info(`Editing user with ID: ${req.params.id}`);
    UsersController.editUserById(req, res, next);
});

router.delete('/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), (req, res, next) => {
    logger.info(`Deleting user with ID: ${req.params.id}`);
    UsersController.deleteUserById(req, res, next);
});

router.patch('/assign-bins/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), (req, res, next) => {
    logger.info(`Assigning bins to user with ID: ${req.params.id}`);
    UsersController.assignBins(req, res, next);
});

// Authentication routes

router.post('/login', (req, res, next) => {
    logger.info(`User login attempt: ${req.body.email}`);
    UsersController.loginUser(req, res, next);
}); // User login

router.put('/change-password/:id', auth.validate, auth.roleGuard('Admin'), (req, res, next) => {
    logger.info(`Changing password for user with ID: ${req.params.id}`);
    UsersController.changePassword(req, res, next);
}); // Admin access only

// Add error handling middleware
router.use(errorHandler);

module.exports = router;