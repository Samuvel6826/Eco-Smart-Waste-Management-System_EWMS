const { logger: customLogger } = require('../utils/logger');
const admin = require('firebase-admin');
const { sendPushNotificationSchema } = require("../models/pushNotificationModel");
const { getFormattedDate } = require('../utils/deviceMonitoring');

const firebaseApp = admin.apps.length ? admin.app() : admin.initializeApp();
const firebaseDB = firebaseApp.database();

const cleanUpExpiredNotifications = async (userId) => {
    const now = new Date().getTime();

    try {
        const notificationsRef = firebaseDB.ref(`Push-Notifications/${userId}`);
        const snapshot = await notificationsRef.once("value");
        const notifications = snapshot.val();

        if (!notifications) {
            customLogger.info(`No notifications found for user ${userId}`, { context: 'cleanUpExpiredNotifications' });
            return;
        }

        for (const [notificationId, notification] of Object.entries(notifications)) {
            const expiryTimestamp = notification.expiryTimestamp;

            if (!expiryTimestamp) {
                customLogger.warn(`No expiry timestamp found for notification ${notificationId}, skipping cleanup`, { context: 'cleanUpExpiredNotifications' });
                continue;
            }

            if (now >= expiryTimestamp) {
                await notificationsRef.child(notificationId).remove();
                customLogger.info(`Expired notification ${notificationId} deleted`, { context: 'cleanUpExpiredNotifications' });
            }
        }
    } catch (error) {
        customLogger.error(`Error cleaning up expired notifications: ${error.message}`, { context: 'cleanUpExpiredNotifications' });
    }
};

const getUserNotifications = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({
            message: "User ID is required",
            success: false
        });
    }

    try {
        const notificationsRef = firebaseDB.ref(`Push-Notifications/${userId}`);
        const snapshot = await notificationsRef.once("value");
        const notifications = snapshot.val();

        if (!notifications) {
            return res.status(200).json({
                message: "No notifications found",
                notifications: [],
                success: true
            });
        }

        const notificationsArray = Object.entries(notifications).map(([key, value]) => ({
            ...value,
            _notificationId: key
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications: notificationsArray,
            success: true
        });
    } catch (error) {
        customLogger.error(`Failed to retrieve notifications: ${error.message}`, { context: 'getUserNotifications' });
        res.status(500).json({
            message: "Failed to retrieve notifications",
            success: false,
            error: error.message
        });
    }
};

const sendFirebaseNotification = async (req, res) => {
    const { title, body, deviceToken, userId, notificationType } = req.body;

    try {
        const { error } = sendPushNotificationSchema.validate(req.body);
        if (error) {
            customLogger.error(`Validation failed: ${error.details.map(detail => detail.message).join(', ')}`, { context: 'sendFirebaseNotification' });
            return res.status(400).json({
                message: "Invalid input data",
                success: false,
                errors: error.details,
            });
        }

        const notificationId = firebaseDB.ref().push().key;
        const expiryTimestamp = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

        const notificationData = {
            _notificationId: notificationId,
            title: title,
            body: body,
            userId: userId,
            notificationType: notificationType,
            timestamp: getFormattedDate(),
            read: false,
            expiryTimestamp: expiryTimestamp,
        };

        await firebaseDB.ref(`Push-Notifications/${userId}/${notificationId}`).set(notificationData);
        await cleanUpExpiredNotifications(userId);

        const message = {
            notification: {
                title,
                body,
            },
            token: deviceToken,
        };

        const fcmResponse = await firebaseApp.messaging().send(message);

        res.status(200).json({
            message: "Notification sent successfully",
            success: true,
            notificationId,
            fcmResponse,
        });
    } catch (error) {
        customLogger.error(`Failed to send notification: ${error.message}`, { context: 'sendFirebaseNotification' });
        res.status(500).json({
            message: "Failed to send notification",
            success: false,
            error: error.message,
        });
    }
};

const markAsRead = async (req, res) => {
    const { notificationId, userId } = req.body;

    try {
        await firebaseDB.ref(`Push-Notifications/${userId}/${notificationId}`).update({ read: true });

        res.status(200).json({
            message: 'Notification marked as read',
            success: true,
        });
    } catch (error) {
        customLogger.error(`Failed to mark notification as read: ${error.message}`, { context: 'markAsRead' });
        res.status(500).json({
            message: 'Failed to mark notification as read',
            success: false,
            error: error.message,
        });
    }
};

const clearNotification = async (req, res) => {
    const { notificationId, userId } = req.body;

    try {
        await firebaseDB.ref(`Push-Notifications/${userId}/${notificationId}`).remove();

        res.status(200).json({
            message: 'Notification cleared',
            success: true,
        });
    } catch (error) {
        customLogger.error(`Failed to clear notification: ${error.message}`, { context: 'clearNotification' });
        res.status(500).json({
            message: 'Failed to clear notification',
            success: false,
            error: error.message,
        });
    }
};

const clearAllNotifications = async (req, res) => {
    const { userId } = req.body;

    try {
        await firebaseDB.ref(`Push-Notifications/${userId}`).remove();

        res.status(200).json({
            message: 'All notifications cleared',
            success: true,
        });
    } catch (error) {
        customLogger.error(`Failed to clear all notifications: ${error.message}`, { context: 'clearAllNotifications' });
        res.status(500).json({
            message: 'Failed to clear all notifications',
            success: false,
            error: error.message,
        });
    }
};

const markAllAsRead = async (req, res) => {
    const { userId } = req.body;

    try {
        const notificationsRef = firebaseDB.ref(`Push-Notifications/${userId}`);
        const snapshot = await notificationsRef.once("value");
        const notifications = snapshot.val();

        if (!notifications) {
            return res.status(200).json({
                message: 'No notifications to mark as read',
                success: true,
            });
        }

        const updates = {};
        for (const notificationId in notifications) {
            updates[`${notificationId}/read`] = true;
        }

        await notificationsRef.update(updates);

        res.status(200).json({
            message: 'All notifications marked as read',
            success: true,
        });
    } catch (error) {
        customLogger.error(`Failed to mark all notifications as read: ${error.message}`, { context: 'markAllAsRead' });
        res.status(500).json({
            message: 'Failed to mark all notifications as read',
            success: false,
            error: error.message,
        });
    }
};

module.exports = {
    getUserNotifications,
    sendFirebaseNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    clearNotification,
};