import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Typography, IconButton } from '@material-tailwind/react';
import { getNotificationIcon } from './utils';
import { usePushNotificationsHook } from '../../contexts/providers/hooks/usePushNotificationsHook';
import { FaTrash, FaCheck } from 'react-icons/fa';

// Extend dayjs with necessary plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to Asia/Kolkata
dayjs.tz.setDefault('Asia/Kolkata');

export const NotificationItem = ({ notification }) => {
    const { markNotificationAsRead, clearNotification } = usePushNotificationsHook();

    // Format and validate the timestamp
    const formatTimestamp = (timestamp) => {
        try {
            if (!timestamp) {
                return {
                    formattedDate: dayjs().tz('Asia/Kolkata'),
                    isValid: false
                };
            }

            // Basic validation for timestamp format
            const timestampRegex = /^\d{2}\/\d{2}\/\d{4},\s+\d{2}:\d{2}:\d{2}\s+[AP]M$/;
            if (!timestampRegex.test(timestamp)) {
                console.warn('Invalid timestamp format:', timestamp);
                return {
                    formattedDate: dayjs().tz('Asia/Kolkata'),
                    isValid: false
                };
            }

            // Split and parse the timestamp
            const [datePart, timePart] = timestamp.split(', ');
            const notificationDateTime = `${datePart} ${timePart}`;

            // Parse the datetime string in Asia/Kolkata timezone
            const parsedDate = dayjs.tz(
                notificationDateTime,
                'DD/MM/YYYY hh:mm:ss A',
                'Asia/Kolkata'
            );

            // Validate the parsed date
            if (!parsedDate.isValid()) {
                console.warn('Invalid date after parsing:', notificationDateTime);
                return {
                    formattedDate: dayjs().tz('Asia/Kolkata'),
                    isValid: false
                };
            }

            return {
                formattedDate: parsedDate,
                isValid: true
            };
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return {
                formattedDate: dayjs().tz('Asia/Kolkata'),
                isValid: false
            };
        }
    };

    const { formattedDate, isValid } = formatTimestamp(notification.timestamp);

    // Format display times
    const getDisplayTimes = () => {
        try {
            return {
                timeAgo: formattedDate.fromNow(),
                fullDateTime: formattedDate.format('DD/MM/YYYY hh:mm A')
            };
        } catch (error) {
            console.error('Error getting display times:', error);
            return {
                timeAgo: 'Recently',
                fullDateTime: 'Date unavailable'
            };
        }
    };

    const { timeAgo, fullDateTime } = getDisplayTimes();

    const handleMarkAsRead = () => {
        if (!notification.read) {
            markNotificationAsRead(notification._notificationId);
        }
    };

    const handleClearNotification = () => {
        clearNotification(notification._notificationId);
    };

    return (
        <div
            className={`flex items-start gap-3 p-3 border-b last:border-0 ${!notification.read ? 'bg-blue-50/50' : ''}`}
            onClick={handleMarkAsRead}
        >
            <div className="flex-shrink-0">
                {getNotificationIcon(notification.notificationType)}
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <Typography variant="small" className="font-medium">
                        {notification.title}
                    </Typography>
                    <div className="flex flex-col items-end">
                        <Typography variant="small" className="text-gray-500">
                            {timeAgo}
                        </Typography>
                        <Typography variant="small" className="text-xs text-gray-400">
                            {fullDateTime}
                        </Typography>
                    </div>
                </div>
                <Typography variant="small" className="mt-1 text-gray-700">
                    {notification.body}
                </Typography>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                {!notification.read && (
                    <IconButton
                        size="sm"
                        variant="text"
                        color="blue"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead();
                        }}
                    >
                        <FaCheck className="h-4 w-4" />
                    </IconButton>
                )}
                <IconButton
                    size="sm"
                    variant="text"
                    color="red"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClearNotification();
                    }}
                >
                    <FaTrash className="h-4 w-4" />
                </IconButton>
            </div>
        </div>
    );
};