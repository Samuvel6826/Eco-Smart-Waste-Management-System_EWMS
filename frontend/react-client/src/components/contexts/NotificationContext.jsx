import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { getToken } from 'firebase/messaging';
import { requestNotificationPermissionToken, onMessageListener, messaging } from '../../../firebase.config';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notificationToken, setNotificationToken] = useState(null);
    const [notificationStatus, setNotificationStatus] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useAuth();

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

    const registerDeviceToken = useCallback(async () => {
        if (!notificationToken) return;

        try {
            await axiosInstance.post('/api/user/notification-send', { deviceToken: notificationToken });
        } catch (error) {
            console.error('Error registering device token:', error.response?.data || error.message);
            throw error;
        }
    }, [axiosInstance, notificationToken]);

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

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};