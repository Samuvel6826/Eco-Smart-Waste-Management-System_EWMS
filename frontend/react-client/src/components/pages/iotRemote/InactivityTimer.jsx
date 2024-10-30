import React from 'react';

const InactivityTimer = ({ remainingTime }) => {
    const progress = (remainingTime / 10) * 100; // Assuming 10 seconds is the full duration

    const getProgressColor = () => {
        if (progress > 50) {
            return 'bg-green-500'; // Success color
        } else if (progress > 20) {
            return 'bg-yellow-500'; // Warning color
        } else {
            return 'bg-red-500'; // Danger color
        }
    };

    return (
        <div className="mt-4 w-full">
            <p className="text-center text-gray-600">
                Inactivity Timer: {remainingTime} seconds
            </p>
            <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                <div
                    className={`h-2.5 rounded-full ${getProgressColor()}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default InactivityTimer;