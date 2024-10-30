// UserStatsCard.jsx
import React from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export const UserStatsCard = ({ role, count }) => (
    <Card className="relative overflow-hidden">
        <CardBody className="p-4">
            <div className="absolute right-4 top-4 rounded-full bg-blue-gray-50/50 p-2">
                <UserCircleIcon className="h-6 w-6 text-blue-gray-500" />
            </div>
            <Typography variant="h6" color="blue-gray">
                {role}s
            </Typography>
            <Typography variant="h4" color="blue-gray" className="mt-2">
                {count}
            </Typography>
        </CardBody>
    </Card>
);