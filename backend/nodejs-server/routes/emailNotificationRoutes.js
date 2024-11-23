const express = require('express');
const { sendEmail } = require('../controllers/emailNotificationControllers');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const UsersRateLimiter = require('../middlewares/usersRateLimiter');
const { errorHandlerMiddleware } = require('../middlewares/errorHandlers');

// Email notification management routes (Resend)
router.post('/sendEmailNotification', auth.validate, sendEmail); // Properly handle async route

// Apply error handling middleware
router.use(errorHandlerMiddleware);

module.exports = router;