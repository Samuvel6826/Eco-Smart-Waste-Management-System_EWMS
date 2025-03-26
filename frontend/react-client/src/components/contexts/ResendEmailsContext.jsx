import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthHook } from './AuthContext';

// Initial email details
const initialEmailDetails = {
    from: 'Acme <acme@example.com>',
    to: ['recipient@example.com'],
    subject: 'Hello World',
    html: '<strong>It works!</strong>'
};

// Create the context
export const ResendEmailsContext = createContext(null);

// Provider Component
export function ResendEmailsProvider({ children }) {
    const [error, setError] = useState(null);
    const { logout } = useAuthHook();
    const [emailDetails, setEmailDetails] = useState(initialEmailDetails);

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: `${import.meta.env.VITE_SERVER_HOST_URL}/api/emailNotification`,
            withCredentials: true,
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

    const handleError = useCallback((error) => {
        const response = error.response;
        let message = '';

        if (!response) {
            message = 'Network error: Unable to connect to the server. Please check your internet connection.';
        } else if (response.data?.error) {
            message = response.data.error.message;
            console.error('API Error Details:', {
                status: response.status,
                message,
                responseData: response.data,
            });
        } else if (response.status >= 500) {
            message = 'Server error: Something went wrong on our end. Please try again later.';
        } else if (response.status === 401) {
            message = 'Unauthorized access: Your session has expired. Please log in again.';
            logout();
        } else if (response.status >= 400) {
            message = response.data?.message || 'An unexpected error occurred. Please try again.';
        } else {
            message = 'An unexpected error occurred.';
        }

        setError(message);
        toast.error(message);
    }, [logout]);

    const sendEmail = useCallback(async (from, to, subject, html) => {
        try {
            const response = await axiosInstance.post('/sendPushNotification', {
                from,
                to,
                subject,
                html
            });

            if (response.data.error) {
                console.log('Error:', response.data.error);
                return response.data;
            }

            console.log('Success:', response.data);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, [axiosInstance, handleError]);

    const value = useMemo(() => ({
        emailDetails,
        setEmailDetails,
        sendEmail,
        error
    }), [emailDetails, sendEmail, error]);

    return (
        <ResendEmailsContext.Provider value={value}>
            {children}
        </ResendEmailsContext.Provider>
    );
}

// Custom hook for using the Email context
export function useResendEmailsHook() {
    const context = useContext(ResendEmailsContext);
    if (!context) {
        throw new Error('useResendEmailsHook must be used within a ResendEmailsProvider');
    }
    return context;
}
