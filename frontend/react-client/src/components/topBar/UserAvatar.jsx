// src/components/navigation/UserAvatar.jsx
import React from 'react';
import { FaCircleUser } from 'react-icons/fa6';

export const UserAvatar = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="rounded-full border-2 border-blue-500/20 bg-blue-500/10 p-1">
            <FaCircleUser className={`${sizeClasses[size]} text-blue-600`} />
        </div>
    );
};

