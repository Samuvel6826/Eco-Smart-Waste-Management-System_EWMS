import React, { forwardRef } from 'react';
import { Card, CardBody, Typography, Progress, Tooltip } from "@material-tailwind/react";
import {
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';

// Create a forwardRef wrapper component for the icon
const TooltipIcon = forwardRef((props, ref) => (
    <div ref={ref}>
        <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    </div>
));

TooltipIcon.displayName = 'TooltipIcon';

export const MetricCard = ({ icon: Icon, value, label, alert, onChange }) => {
    const numericValue = parseInt(value);
    const isWarning = numericValue < 20;
    const isError = numericValue < 10;

    return (
        <Card className="transition-all duration-300 hover:shadow-lg">
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${isError ? 'bg-red-100' :
                                isWarning ? 'bg-yellow-100' :
                                    'bg-blue-100'
                            }`}>
                            <Icon className={`h-5 w-5 ${isError ? 'text-red-500' :
                                    isWarning ? 'text-yellow-500' :
                                        'text-blue-500'
                                }`} />
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                {label}
                            </Typography>
                            <Typography variant="h4" className="font-bold">
                                {value}
                            </Typography>
                        </div>
                    </div>
                    {alert && (
                        <Tooltip content={alert}>
                            <TooltipIcon />
                        </Tooltip>
                    )}
                </div>
                <Progress
                    value={numericValue}
                    size="lg"
                    className="mt-4"
                    color={isError ? "red" : isWarning ? "yellow" : "blue"}
                />
            </CardBody>
        </Card>
    );
};

// StatusIndicator component remains the same
export const StatusIndicator = ({ status, label }) => (
    <div className="flex items-center justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-gray-50">
        <div className="flex items-center gap-3">
            {status ? (
                <FaCheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <FaTimesCircle className="h-5 w-5 text-red-500" />
            )}
            <Typography color="blue-gray">{label}</Typography>
        </div>
        <Typography color={status ? "green" : "red"}>
            {status ? "Active" : "Inactive"}
        </Typography>
    </div>
);

// TimelineEvent component remains the same
export const TimelineEvent = ({ icon: Icon, label, timestamp }) => (
    <div className="flex items-center gap-4 border-l-2 border-blue-gray-50 py-2 pl-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
            <Typography variant="small" className="font-medium">
                {label}
            </Typography>
            <Typography variant="small" color="gray">
                {timestamp || 'N/A'}
            </Typography>
        </div>
    </div>
);