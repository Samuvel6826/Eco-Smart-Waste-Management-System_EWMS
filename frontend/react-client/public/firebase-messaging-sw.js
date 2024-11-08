// Import Firebase SDK for the compat version
self.importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// Firebase configuration details (replace with your own values)
const firebaseConfig = {
    apiKey: "AIzaSyDAzbmHjRnnn3ebOn7_ijdoy2t2B9vadL4",
    authDomain: "eco-smart-wms.firebaseapp.com",
    databaseURL: "https://eco-smart-wms-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eco-smart-wms",
    storageBucket: "eco-smart-wms.appspot.com",
    messagingSenderId: "230677104278",
    appId: "1:230677104278:web:4a9f2b1757c98b0e1da4b7"
};

// Initialize Firebase in the service worker
self.firebase.initializeApp(firebaseConfig);

// Get the messaging instance
const messaging = self.firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Safeguard: Check if the payload and notification data exist
    if (payload && payload.notification) {
        const { title, body, icon } = payload.notification;

        if (title && body && icon) {
            // Show the notification with title, body, and icon
            self.registration.showNotification(title, {
                body: body,
                icon: icon
            });
        } else {
            console.error('[firebase-messaging-sw.js] Notification data is missing title, body, or icon');
        }
    } else {
        console.error('[firebase-messaging-sw.js] Invalid payload received: No notification data');
    }
});