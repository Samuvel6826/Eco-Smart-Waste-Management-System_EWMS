const admin = require('firebase-admin');

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

            console.log("Connected to Firebase Realtime Database successfully");
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            process.exit(1);
        }
    }
    return admin;
};

module.exports = initializeFirebase;