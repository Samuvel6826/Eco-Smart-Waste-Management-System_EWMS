// useNotification.jsx
import { useContext } from 'react';
import { NotificationsContext } from '../../NotificationsContext';

export function useNotificationsHook() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};