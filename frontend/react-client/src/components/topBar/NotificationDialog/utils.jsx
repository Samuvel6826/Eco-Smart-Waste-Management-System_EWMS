import dayjs from 'dayjs';

import { IoWarning } from 'react-icons/io5';
import { FaCheck, FaBell } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { BiTask } from 'react-icons/bi';

export const getNotificationIcon = (type) => {
    switch (type) {
        case 'warning':
            return <IoWarning className="h-5 w-5 text-orange-500" />;
        case 'success':
            return <FaCheck className="h-5 w-5 text-green-500" />;
        case 'error':
            return <MdError className="h-5 w-5 text-red-500" />;
        case 'task':
            return <BiTask className="h-5 w-5 text-purple-500" />;
        default:
            return <FaBell className="h-5 w-5 text-blue-500" />;
    }
};

export const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString();
};

export const groupNotificationsByDate = (notifications) => {
    const groups = {
        today: [],
        yesterday: [],
        older: []
    };

    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    notifications.forEach(notification => {
        const notificationDate = dayjs(notification.timestamp, 'DD/MM/YYYY, HH:mm:ss A');

        if (notificationDate.isSame(today, 'day')) {
            groups.today.push(notification);
        } else if (notificationDate.isSame(yesterday, 'day')) {
            groups.yesterday.push(notification);
        } else {
            groups.older.push(notification);
        }
    });

    return groups;
};