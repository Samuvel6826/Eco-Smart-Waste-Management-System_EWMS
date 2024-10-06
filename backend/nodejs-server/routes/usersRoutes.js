const express = require('express');
const UsersController = require('../controllers/users');
const router = express.Router();
const auth = require('../common/Auth');

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
    console.error(err);
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

router.get('/list', auth.validate, auth.roleGuard('Admin', 'Manager'), UsersController.getUsers);

router.get('/:id', auth.validate, UsersController.getUserById); // Authenticated access

router.post('/', UsersController.createUser); // Create a new user

router.put('/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), UsersController.editUserById);

router.delete('/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), UsersController.deleteUserById);

router.patch('/assign-bins/:id', auth.validate, auth.roleGuard('Admin', 'Manager'), UsersController.assignBins);

// Authentication routes

router.post('/login', UsersController.loginUser); // User login

router.put('/change-password/:id', auth.validate, auth.roleGuard('Admin'), UsersController.changePassword); // Admin access only

// Add error handling middleware
router.use(errorHandler);

module.exports = router;