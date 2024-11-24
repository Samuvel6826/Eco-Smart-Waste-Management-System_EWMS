import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Typography, IconButton } from '@material-tailwind/react';
import { getNotificationIcon } from './utils';
import { usePushNotificationsHook } from '../../contexts/providers/hooks/usePushNotificationsHook';
import { FaTrash, FaCheck } from 'react-icons/fa';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default timezone
dayjs.tz.setDefault('Asia/Kolkata');

// Updated format string to match the exact format
const DB_DATE_FORMAT = 'DD/MM/YYYY, hh:mm:ss A';

const formatTimestamp = (timestamp) => {
    try {
        if (!timestamp) {
            // console.warn('No timestamp provided');
            return {
                formattedDate: dayjs(),
                isValid: false
            };
        }

        // Debug logging
        // console.log('Received timestamp:', timestamp);
        // console.log('Expected format:', DB_DATE_FORMAT);

        // First try parsing with strict mode
        let parsedDate = dayjs(timestamp, DB_DATE_FORMAT, true);

        // If that fails, try with some common variations
        if (!parsedDate.isValid()) {
            // Try without seconds
            parsedDate = dayjs(timestamp, 'DD/MM/YYYY, hh:mm A', true);
        }

        if (!parsedDate.isValid()) {
            // Try with 24-hour format
            parsedDate = dayjs(timestamp, 'DD/MM/YYYY, HH:mm:ss', true);
        }

        // console.log('Parsed date valid:', parsedDate.isValid());
        if (parsedDate.isValid()) {
            // console.log('Successfully parsed to:', parsedDate.format());
        }

        if (!parsedDate.isValid()) {
            return {
                formattedDate: dayjs(),
                isValid: false
            };
        }

        // Convert to timezone after successful parse
        const dateWithTZ = parsedDate.tz('Asia/Kolkata');

        return {
            formattedDate: dateWithTZ,
            isValid: true
        };

    } catch (error) {
        // console.error('Error formatting timestamp:', error);
        // console.error('Problematic timestamp:', timestamp);
        return {
            formattedDate: dayjs(),
            isValid: false
        };
    }
};

export const NotificationItem = ({ notification }) => {
    const { markNotificationAsRead, clearNotification } = usePushNotificationsHook();

    const { formattedDate, isValid } = formatTimestamp(notification?.timestamp);

    const getDisplayTimes = () => {
        try {
            if (!isValid) {
                return {
                    timeAgo: 'Just now',
                    fullDateTime: notification?.timestamp || 'Recent' // Fall back to original timestamp
                };
            }

            const now = dayjs().tz('Asia/Kolkata');
            const diffInHours = now.diff(formattedDate, 'hour');

            return {
                timeAgo: diffInHours < 24 ? formattedDate.fromNow() : formattedDate.format('DD/MM/YYYY'),
                fullDateTime: formattedDate.format('DD/MM/YYYY, hh:mm:ss A') // Updated to include seconds
            };
        } catch (error) {
            console.error('Error getting display times:', error);
            return {
                timeAgo: 'Just now',
                fullDateTime: notification?.timestamp || 'Recent' // Fall back to original timestamp
            };
        }
    };

    const { timeAgo, fullDateTime } = getDisplayTimes();

    const handleMarkAsRead = () => {
        if (!notification?.read) {
            markNotificationAsRead(notification?._notificationId);
        }
    };

    const handleClearNotification = () => {
        clearNotification(notification?._notificationId);
    };

    return (
        <div
            className={`flex items-start gap-3 p-3 border-b last:border-0 ${!notification?.read ? 'bg-blue-50/50' : ''
                }`}
            onClick={handleMarkAsRead}
        >
            <div className="flex-shrink-0">
                {getNotificationIcon(notification?.notificationType)}
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <Typography variant="small" className="font-medium">
                        {notification?.title || 'Notification'}
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
                    {notification?.body || ''}
                </Typography>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                {!notification?.read && (
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

export default NotificationItem;