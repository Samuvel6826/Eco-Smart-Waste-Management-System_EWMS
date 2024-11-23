// src/components/navigation/UserBadge.jsx
import React from 'react';
import { Typography } from '@material-tailwind/react';

export const UserBadge = ({ role }) => (
    <div className="mt-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${role === 'Admin' ? 'bg-green-500' : 'bg-blue-500'
            } animate-pulse`} />
        <Typography variant="small" className="font-medium text-blue-gray-600">
            {role}
        </Typography>
    </div>
);