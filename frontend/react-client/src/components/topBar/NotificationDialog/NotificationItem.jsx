import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Typography, IconButton } from '@material-tailwind/react';
import { getNotificationIcon } from './utils';
import { usePushNotificationsHook } from '../../contexts/providers/hooks/usePushNotificationsHook';
import { FaTrash, FaCheck } from 'react-icons/fa';

dayjs.extend(relativeTime);

export const NotificationItem = ({ notification }) => {
    const { markNotificationAsRead, clearNotification } = usePushNotificationsHook();

    // Split the timestamp at the comma
    const [datePart, timePart] = notification.timestamp.split(', ');

    // Combine the date and time parts into a full datetime string
    const notificationDateTime = `${datePart} ${timePart}`;

    // Parse the full datetime using dayjs
    const notificationDate = dayjs(notificationDateTime, 'DD/MM/YYYY hh:mm:ss A');

    // Get the relative time
    const timeAgo = notificationDate.fromNow();

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
                    <Typography variant="small" className="text-gray-500">
                        {timeAgo}
                    </Typography>
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
                            e.stopPropagation(); // Prevent triggering the parent onClick
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
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        handleClearNotification();
                    }}
                >
                    <FaTrash className="h-4 w-4" />
                </IconButton>
            </div>
        </div>
    );
};