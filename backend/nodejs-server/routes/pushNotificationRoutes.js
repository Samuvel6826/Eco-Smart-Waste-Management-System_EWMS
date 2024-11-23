const express = require('express');
const PushNotificationController = require('../controllers/pushNotificationControllers');
const router = express.Router();
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const UsersRateLimiter = require('../middlewares/usersRateLimiter');
const { errorHandlerMiddleware } = require('../middlewares/errorHandlers');

// Push notification management routes
router.get('/getUserNotifications',
    auth.validate,
    PushNotificationController.getUserNotifications
);

router.post('/sendPushNotification',
    auth.validate,
    PushNotificationController.sendFirebaseNotification
);

router.post('/markAsRead',
    // auth.validate,
    PushNotificationController.markAsRead
);

router.delete('/clearNotification',
    auth.validate,
    PushNotificationController.clearNotification
);

router.delete('/clearAllNotifications',
    auth.validate,
    PushNotificationController.clearAllNotifications
);

router.post('/markAllAsRead',
    auth.validate,
    PushNotificationController.markAllAsRead
);

// Apply error handling middleware
router.use(errorHandlerMiddleware);

module.exports = router;