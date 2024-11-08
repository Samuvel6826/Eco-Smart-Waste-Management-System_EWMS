import { toast } from 'react-hot-toast';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getDatabase, ref as databaseRef, onValue, child, off, get, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//         .register('/firebase-messaging-sw.js')
//         .then((registration) => {
//             console.log('Service Worker registered:', registration);
//         })
//         .catch((err) => {
//             console.error('Service Worker registration failed:', err);
//         });
// }

export const requestNotificationPermissionToken = async () => {
    try {
        const currentPermission = await Notification.permission;
        // console.log('Current permission:', currentPermission);

        if (currentPermission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });
            return token;
        } else if (currentPermission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });
                return token;
            } else {
                throw new Error('Notification permission denied');
            }
        } else {
            throw new Error('Notification permission denied');
        }
    } catch (error) {
        console.error('Notification permission error:', error);
        throw error;
    }
};

export const onMessageListener = () => {
    onMessage(messaging, (payload) => {
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg) {
                    reg.showNotification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: payload.notification.icon,
                    });
                }
            });
        }
    });
};

export {
    firebaseApp,
    messaging,
    database,
    storage,
    databaseRef,
    storageRef,
    onValue,
    child,
    get,
    set,
    off,
    uploadBytes,
    getDownloadURL
};
