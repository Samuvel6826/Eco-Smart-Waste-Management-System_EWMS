const initializeFirebase = require('../config/firebaseConfig');

class NotificationService {
    static async sendNotification(deviceToken, title, body) {
        const admin = initializeFirebase();  // Using initialized Firebase app

        const message = {
            token: deviceToken,
            notification: {
                title,
                body
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    icon: '/path/to/icon.png' // Update this path with your actual icon path if needed
                }
            }
        };

        try {
            const response = await admin.messaging().send(message);
            return response;
        } catch (error) {
            if (error.errorInfo) {
                console.error('Firebase Messaging Error:', error.errorInfo.code, '-', error.errorInfo.message);
            } else {
                console.error('Error sending notification:', error);
            }
            throw error;
        }
    }
};

module.exports = NotificationService;