// useNotification.jsx
import { useContext } from 'react';
import { PushNotificationsContext } from '../../PushNotificationsContext';

export function usePushNotificationsHook() {
    const context = useContext(PushNotificationsContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};