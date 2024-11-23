import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FaceDetection = () => {
    const [detectedName, setDetectedName] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Create EventSource for Server-Sent Events
        const eventSource = new EventSource('/face_detection_stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setDetectedName(data.name);

            // Here you can implement your login logic
            // For example, if the detected name matches an authorized user:
            if (data.name !== 'Unknown') {
                console.log('Authorized user detected:', data.name);
                // You can trigger your login function here
                // handleLogin(data.name);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        // Cleanup on component unmount
        return () => {
            eventSource.close();
        };
    }, [navigate]);

    return (
        <div className="mx-auto w-full max-w-md p-4">
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
                {/* Video Feed */}
                <div className="relative">
                    <img
                        src="/video_feed"
                        alt="Face Detection Feed"
                        className="w-full"
                    />
                </div>

                {/* Detection Status */}
                {detectedName && (
                    <div className={`p-4 text-center ${detectedName !== 'Unknown'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        <p className="text-lg font-semibold">
                            {detectedName !== 'Unknown'
                                ? `Welcome, ${detectedName}!`
                                : 'Unknown face detected'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceDetection;