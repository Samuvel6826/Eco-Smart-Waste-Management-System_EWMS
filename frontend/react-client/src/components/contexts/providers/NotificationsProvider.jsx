import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { getToken } from 'firebase/messaging';
import { requestNotificationPermissionToken, onMessageListener, messaging } from '../../../../firebase.config';
import { NotificationsContext } from '../NotificationsContext';
import { useAuthHook } from './hooks/useAuthHook';
import { toast } from 'react-hot-toast';

export function NotificationsProvider({ children }) {
    const [notificationToken, setNotificationToken] = useState(null);
    const [notificationStatus, setNotificationStatus] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useAuthHook();

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_SERVER_HOST_URL,
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

    const handleError = useCallback((err) => {
        const message = err.response?.data?.message || 'An unexpected error occurred.';
        setError(message);
        toast.error(message);
        console.error('API Error:', err.response?.data, err.message);
        if (err.response?.status === 401) {
            logout();
        }
    }, [logout]);

    const registerDeviceToken = useCallback(async (payload) => {
        if (!payload.title || !payload.body) {
            console.error('Notification payload missing required fields');
            return;
        }

        try {
            if (!notificationToken || notificationStatus !== 'granted') {
                // If push notifications are not available, fall back to toast
                console.log('Push notifications not available, falling back to toast notification');
                toast.error(payload.body)
                return;
            }

            await axiosInstance.post('/api/user/notification-send', {
                deviceToken: notificationToken,
                title: payload.title,
                body: payload.body,
            });
        } catch (error) {
            console.error('Failed to send push notification:', error.response?.data || error.message);
            // Fallback to toast notification if push notification fails
            toast(({ visible }) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{payload.body}</span>
                    {error.response?.data?.message && (
                        <span className="text-sm text-gray-500">
                            Error: {error.response.data.message}
                        </span>
                    )}
                </div>
            ), {
                duration: 4000,
                icon: '🔔',
                position: 'top-right',
            });
        }
    }, [axiosInstance, notificationToken, notificationStatus]);

    const requestPermission = useCallback(async () => {
        if (notificationStatus !== 'pending') return;

        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const token = await requestNotificationPermissionToken();
                const currentToken = await getToken(messaging);

                if (currentToken === token) {
                    setNotificationToken(token);
                    setNotificationStatus('granted');
                } else {
                    throw new Error('Token verification failed');
                }
            } else {
                setNotificationStatus('denied');
            }
        } catch (error) {
            setError(error.message);
            setNotificationStatus('denied');
        }
    }, [notificationStatus]);

    useEffect(() => {
        let cleanup;

        const initializeNotifications = async () => {
            setLoading(true);
            try {
                cleanup = await onMessageListener();
                await requestPermission();
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        };

        if (!notificationToken) {
            initializeNotifications();
        }

        return () => cleanup?.();
    }, [handleError, notificationToken, requestPermission]);

    const value = useMemo(
        () => ({
            notificationToken,
            notificationStatus,
            loading,
            error,
            requestNotifications: requestPermission,
            registerDeviceToken,
        }),
        [notificationToken, notificationStatus, loading, error, requestPermission, registerDeviceToken]
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    )
};