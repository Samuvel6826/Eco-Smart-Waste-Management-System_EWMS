// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAzbmHjRnnn3ebOn7_ijdoy2t2B9vadL4",
    authDomain: "eco-smart-wms.firebaseapp.com",
    databaseURL: "https://eco-smart-wms-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eco-smart-wms",
    storageBucket: "eco-smart-wms.appspot.com",
    messagingSenderId: "230677104278",
    appId: "1:230677104278:web:4a9f2b1757c98b0e1da4b7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // const notificationTitle = payload.notification.title;
    // const notificationOptions = {
    //     body: payload.notification.body,
    //     icon: '/path-to-your-icon.png',
    // };

    // return self.registration.showNotification(notificationTitle, notificationOptions);
});