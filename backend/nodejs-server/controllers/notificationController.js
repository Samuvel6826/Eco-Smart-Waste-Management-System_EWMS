const { logger } = require('../utils/logger');  // Import the logger

const NotificationService = require("../service/firebaseService");

const sendFirebaseNotification = async (req, res) => {
    try {
        const { title, body, deviceToken } = req.body;

        // Log the incoming request
        logger.info(`sendFirebaseNotification called with title: ${title}, body: ${body}`);

        // Basic validation
        if (!deviceToken || !title || !body) {
            logger.error('Missing required fields: deviceToken, title, or body');
            return res.status(400).json({ message: "Missing required fields: deviceToken, title, or body", success: false });
        }

        // Send notification
        await NotificationService.sendNotification(deviceToken, title, body);

        // Log the success
        logger.info('Notification sent successfully');

        // Respond with success
        res.status(200).json({ message: "Notification sent successfully", success: true });
    } catch (error) {
        logger.error(`Error sending notification: ${error.message}`);
        res.status(500).json({ message: "Error sending notification", success: false });
    }
};

module.exports = { sendFirebaseNotification };