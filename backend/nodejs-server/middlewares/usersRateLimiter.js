const rateLimit = require('express-rate-limit');

// Rate limit configurations for user routes
const rateLimits = {
    getUsers: { requests: 100, timeFrame: 15 },
    getUserById: { requests: 200, timeFrame: 15 },
    createUser: { requests: 25, timeFrame: 15 },
    editUser: { requests: 50, timeFrame: 15 },
    deleteUser: { requests: 20, timeFrame: 60 },
    login: { requests: 5, timeFrame: 15 },
    changePassword: { requests: 5, timeFrame: 15 },
    assignBins: { requests: 100, timeFrame: 15 }
};

// Create rate limiters
const getAllUsersLimiter = rateLimit({
    windowMs: rateLimits.getUsers.timeFrame * 60 * 1000,
    max: rateLimits.getUsers.requests,
    message: 'Too many requests to fetch users, please try again later.'
});

const getUserByIdLimiter = rateLimit({
    windowMs: rateLimits.getUserById.timeFrame * 60 * 1000,
    max: rateLimits.getUserById.requests,
    message: 'Too many requests to fetch specific user, please try again later.'
});

const createUserLimiter = rateLimit({
    windowMs: rateLimits.createUser.timeFrame * 60 * 1000,
    max: rateLimits.createUser.requests,
    message: 'Too many user creation requests, please try again later.'
});

const editUserLimiter = rateLimit({
    windowMs: rateLimits.editUser.timeFrame * 60 * 1000,
    max: rateLimits.editUser.requests,
    message: 'Too many user edit requests, please try again later.'
});

const deleteUserLimiter = rateLimit({
    windowMs: rateLimits.deleteUser.timeFrame * 60 * 1000,
    max: rateLimits.deleteUser.requests,
    message: 'Too many user deletion requests, please try again later.'
});

const loginLimiter = rateLimit({
    windowMs: rateLimits.login.timeFrame * 60 * 1000,
    max: rateLimits.login.requests,
    message: 'Too many login attempts, please try again later.'
});

const changePasswordLimiter = rateLimit({
    windowMs: rateLimits.changePassword.timeFrame * 60 * 1000,
    max: rateLimits.changePassword.requests,
    message: 'Too many password change requests, please try again later.'
});

const assignBinsLimiter = rateLimit({
    windowMs: rateLimits.assignBins.timeFrame * 60 * 1000,
    max: rateLimits.assignBins.requests,
    message: 'Too many bin assignment requests, please try again later.'
});

module.exports = {
    getAllUsersLimiter,
    getUserByIdLimiter,
    createUserLimiter,
    editUserLimiter,
    deleteUserLimiter,
    loginLimiter,
    changePasswordLimiter,
    assignBinsLimiter
};