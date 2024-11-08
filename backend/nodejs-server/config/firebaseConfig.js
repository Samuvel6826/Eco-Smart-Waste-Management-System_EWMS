const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
    if (!firebaseApp) {
        try {
            let serviceAccount;

            if (process.env.RENDER === 'true') {
                serviceAccount = require('/etc/secrets/serviceAccountKey.json');
            } else {
                serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            }

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });

            logger.info('Firebase initialized successfully');
        } catch (error) {
            logger.error('Error initializing Firebase:', error);
            throw error;
        }
    }

    return firebaseApp;
};

module.exports = initializeFirebase;