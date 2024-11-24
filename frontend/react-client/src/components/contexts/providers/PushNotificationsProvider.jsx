import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { getToken } from 'firebase/messaging';
import { requestNotificationPermissionToken, onMessageListener, messaging } from '../../../../firebase.config';
import { PushNotificationsContext } from '../PushNotificationsContext';
import { useAuthHook } from './hooks/useAuthHook';
import { toast } from 'react-hot-toast';

export function PushNotificationsProvider({ children }) {
    const { currentUserId, logout, isAuthenticated } = useAuthHook();
    const [notificationToken, setNotificationToken] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: `${import.meta.env.VITE_SERVER_HOST_URL}/api/pushNotification`,
            withCredentials: true,  // Use withCredentials instead of credentials
            headers: {
                'Content-Type': 'application/json',
            },
        });

        instance.interceptors.request.use(
            (config) => {
                const token = sessionStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return instance;
    }, []);

    const handleError = useCallback(
        (err) => {
            const message = err.response?.data?.message || 'An unexpected error occurred.';
            setError(message);
            toast.error(message);
            console.error('API Error:', err.response?.data, err.message);
            if (err.response?.status === 401) {
                logout();
            }
        },
        [logout]
    );

    const fetchNotifications = useCallback(async () => {
        try {
            if (isAuthenticated) {
                setLoading(true);
                const response = await axiosInstance.get(`/getUserNotifications?userId=${currentUserId}`);

                // Reverse the notifications array to show newest first
                const reversedNotifications = [...response.data.notifications].reverse();

                setNotifications(reversedNotifications);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, currentUserId, handleError, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [currentUserId, fetchNotifications, isAuthenticated]);

    const sendPushNotification = useCallback(
        async (payload) => {
            const { title, body } = payload;

            if (!title || !body || !currentUserId || !notificationToken) {
                toast.error('Missing required notification details');
                return;
            }

            try {
                await axiosInstance.post('/sendPushNotification', {
                    ...payload,
                    userId: currentUserId,
                    deviceToken: notificationToken,
                });
                await fetchNotifications(); // Fetch updated notifications after sending
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, handleError, notificationToken, currentUserId, fetchNotifications]
    );

    const sendPushNotificationOnLogin = useCallback(
        async (payload) => {
            const { title, body } = payload;

            if (!title || !body || !currentUserId || !notificationToken) {
                toast.error('Missing required notification details');
                return;
            }

            try {
                await axiosInstance.post('/sendPushNotification', {
                    ...payload,
                    deviceToken: notificationToken,
                });
                await fetchNotifications(); // Fetch updated notifications after sending
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, handleError, notificationToken, currentUserId, fetchNotifications]
    );

    const markNotificationAsRead = useCallback(
        async (notificationId) => {
            if (!currentUserId) return;

            try {
                await axiosInstance.post('/markAsRead', { notificationId, userId: currentUserId });
                toast.success('Notification marked as read');
                await fetchNotifications(); // Fetch updated notifications after marking as read
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, currentUserId, handleError, fetchNotifications]
    );

    const clearNotification = useCallback(
        async (notificationId) => {
            if (!currentUserId) return;

            try {
                await axiosInstance.delete('/clearNotification', {
                    data: { notificationId, userId: currentUserId },
                });
                toast.success('Notification cleared');
                await fetchNotifications(); // Fetch updated notifications after clearing
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, currentUserId, handleError, fetchNotifications]
    );

    const clearAllNotifications = useCallback(
        async (userId) => {
            try {
                await axiosInstance.delete('/clearAllNotifications', { data: { userId: currentUserId } });
                toast.success('All notifications cleared');
                await fetchNotifications(); // Fetch updated notifications after clearing all
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, handleError, currentUserId, fetchNotifications]
    );

    const markAllNotificationsAsRead = useCallback(
        async (userId) => {
            try {
                await axiosInstance.post('/markAllAsRead', { userId: currentUserId });
                toast.success('All notifications marked as read');
                await fetchNotifications(); // Fetch updated notifications after marking all as read
            } catch (error) {
                handleError(error);
            }
        },
        [axiosInstance, handleError, currentUserId, fetchNotifications]
    );

    useEffect(() => {
        if (currentUserId) {
            let cleanup;

            const initializeNotifications = async () => {
                setLoading(true);
                try {
                    cleanup = await onMessageListener();
                    const token = await requestNotificationPermissionToken();
                    const currentToken = await getToken(messaging);

                    if (currentToken === token) {
                        setNotificationToken(token);
                    }
                    await fetchNotifications(); // Fetch notifications after initialization
                } catch (err) {
                    handleError(err);
                } finally {
                    setLoading(false);
                }
            };

            initializeNotifications();
            return () => cleanup?.();
        }
    }, [currentUserId, handleError, fetchNotifications]);

    const value = useMemo(
        () => ({
            notificationToken,
            notifications,
            loading,
            error,
            sendPushNotification,
            sendPushNotificationOnLogin,
            markNotificationAsRead,
            clearNotification,
            clearAllNotifications,
            markAllNotificationsAsRead,
        }),
        [
            notificationToken,
            notifications,
            loading,
            error,
            sendPushNotification,
            sendPushNotificationOnLogin,
            markNotificationAsRead,
            clearNotification,
            clearAllNotifications,
            markAllNotificationsAsRead,
        ]
    );

    return (
        <PushNotificationsContext.Provider value={value}>
            {children}
        </PushNotificationsContext.Provider>
    );
}