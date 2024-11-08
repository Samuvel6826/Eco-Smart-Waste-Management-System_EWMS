const { initializeApp } = require("firebase/app");
const { getMessaging, getToken } = require("firebase/messaging");

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

const vapidKey = "BGGMiE9vCIySfuiEEGW2TOsnxJdDqPlCL8rzWhvNsDs-V4ORH1u3J_26-GJ-U80WIw11rECVCfw-8NlDjxAxkZA"

const app = initializeApp(firebaseConfig)

const messaging = getMessaging(app);

export const requestFCMToken = async () => {
    return Notification.requestPermission()
        .then((permission) => {
            if (permission === "granted") {
                return getToken(messaging, { vapidKey })
            } else {
                throw new Error("Notification not granted");
            }
        })
        .catch((err) => {
            console.error("Error getting FCM token: ", err)
        })
}