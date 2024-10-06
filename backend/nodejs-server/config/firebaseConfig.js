// config/firebaseConfig.js
const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

const initializeFirebase = () => {
    if (!admin.apps.length) {
        let serviceAccount;
        try {
            serviceAccount = process.env.RENDER === 'true'
                ? require('/etc/secrets/serviceAccountKey.json')
                : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });

            logger.info("Connected to Firebase Realtime Database successfully");
        } catch (error) {
            logger.error("Error initializing Firebase:", error);
            process.exit(1);
        }
    }
    return admin;
};

module.exports = initializeFirebase;