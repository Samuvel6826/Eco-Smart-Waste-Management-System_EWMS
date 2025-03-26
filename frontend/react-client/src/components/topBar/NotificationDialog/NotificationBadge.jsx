import React, { useState } from 'react';
import { IconButton } from '@material-tailwind/react';
import { FaRegBell } from 'react-icons/fa';
import { NotificationDialog } from './NotificationDialog';
import { usePushNotificationsHook } from '../../contexts/PushNotificationsContext'; // New import

// Updated NotificationBadge component
export const NotificationBadge = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications } = usePushNotificationsHook(); // Use the new hook

    // Calculate unread notifications
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <IconButton
                variant="text"
                color="white"
                className="h-9 w-9 transition-colors hover:bg-white/10"
                onClick={() => setIsOpen(true)}
            >
                <FaRegBell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                    </span>
                )}
            </IconButton>
            <NotificationDialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
};