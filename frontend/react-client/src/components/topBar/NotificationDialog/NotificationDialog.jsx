import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
    Chip,
    List,
    IconButton,
} from '@material-tailwind/react';
import {
    BellIcon,
    CheckIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { usePushNotificationsHook } from '../../contexts/PushNotificationsContext';
import { NotificationItem } from './NotificationItem';
import { getNotificationIcon, groupNotificationsByDate } from './utils';

export const NotificationDialog = ({ open, onClose }) => {
    const {
        notifications,
        clearAllNotifications,
        markAllNotificationsAsRead
    } = usePushNotificationsHook();

    const notificationGroups = groupNotificationsByDate(notifications);

    return (
        <Dialog
            open={open}
            handler={onClose}
            className="fixed right-4 top-16 max-h-[80vh] w-96 overflow-hidden"
        >
            <DialogHeader className="flex items-center justify-between border-b border-blue-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Typography variant="h6">
                        Notifications
                    </Typography>
                    {notifications.length > 0 && (
                        <Chip
                            value={notifications.length}
                            size="sm"
                            color="blue"
                            className="rounded-full"
                        />
                    )}
                </div>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={onClose}
                    className="h-8 w-8"
                >
                    <XMarkIcon className="h-4 w-4" />
                </IconButton>
            </DialogHeader>

            <DialogBody className="max-h-[60vh] overflow-y-auto p-0">
                {notifications.length === 0 ? (
                    <EmptyState />
                ) : (
                    <NotificationList
                        notificationGroups={notificationGroups}
                        getNotificationIcon={getNotificationIcon}
                    />
                )}
            </DialogBody>

            {notifications.length > 0 && (
                <DialogFooter className="flex justify-between border-t border-blue-gray-100 px-4 py-2">
                    <Button
                        variant="text"
                        color="blue-gray"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={markAllNotificationsAsRead}
                    >
                        <CheckIcon className="h-4 w-4" />
                        Mark all read
                    </Button>
                    <Button
                        variant="text"
                        color="red"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={clearAllNotifications}
                    >
                        <TrashIcon className="h-4 w-4" />
                        Clear all
                    </Button>
                </DialogFooter>
            )}
        </Dialog>
    );
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8">
        <BellIcon className="mb-4 h-12 w-12 text-blue-gray-300" />
        <Typography color="blue-gray" className="text-center font-medium">
            No notifications yet
        </Typography>
        <Typography color="gray" variant="small" className="mt-1 text-center">
            When you receive notifications, they will appear here
        </Typography>
    </div>
);

const NotificationList = ({ notificationGroups, getNotificationIcon }) => (
    <List className="p-0">
        {Object.entries(notificationGroups).map(([group, items]) => (
            items.length > 0 && (
                <div key={group}>
                    <div className="bg-blue-gray-50/50 px-4 py-2">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-medium uppercase"
                        >
                            {group}
                        </Typography>
                    </div>
                    {items.map(notification => (
                        <NotificationItem
                            key={notification._notificationId}
                            notification={notification}
                            icon={getNotificationIcon(notification.notificationType)}
                        />
                    ))}
                </div>
            )
        ))}
    </List>
);