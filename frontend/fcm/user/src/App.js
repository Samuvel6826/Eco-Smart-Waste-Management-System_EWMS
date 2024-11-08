import React, { useEffect, useState } from 'react';
import { requestFCMToken } from "./utils/firebaseUtils"
import './App.css';

function App() {
  const [fcmToken, setFcmToken] = useState(null)

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken()
        setFcmToken(token)
        console.log(token);

      } catch (error) {
        console.error("Error getting FCM token: ", error);
      }
    }
    fetchFCMToken()
  })
  return (
    <div className="App">

    </div>
  );
}

export default App;
