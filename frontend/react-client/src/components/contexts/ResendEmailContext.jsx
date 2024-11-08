import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Create the context for email management
const ResendEmailContext = createContext();

// Provider Component
const ResendEmailProvider = ({ children }) => {

    const [error, setError] = useState(null);
    const { logout } = useAuth();

    // Initial state for email details
    const [emailDetails, setEmailDetails] = useState({
        from: 'Acme <acme@example.com>',
        to: ['recipient@example.com'],
        subject: 'Hello World',
        html: '<strong>It works!</strong>'
    });

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_SERVER_HOST_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return instance;
    }, []);

    const handleError = useCallback((error) => {
        const response = error.response;
        let message = '';

        if (!response) {
            // Network error
            message = 'Network error: Unable to connect to the server. Please check your internet connection.';
        } else if (response.data?.error) {
            // API returned an error object
            message = response.data.error.message;
            console.error('API Error Details:', {
                status: response.status,
                message,
                responseData: response.data,
            });
        } else if (response.status >= 500) {
            // Server errors (5xx)
            message = 'Server error: Something went wrong on our end. Please try again later.';
        } else if (response.status === 401) {
            // Unauthorized
            message = 'Unauthorized access: Your session has expired. Please log in again.';
            logout();
        } else if (response.status >= 400) {
            // Client errors (4xx)
            message = response.data?.message || 'An unexpected error occurred. Please try again.';
        } else {
            // Generic error
            message = 'An unexpected error occurred.';
        }

        // Set error state and show a toast notification with the specific message
        setError(message);
        toast.error(message);
    }, [logout]);

    const sendEmail = async (from, to, subject, html) => {
        try {
            const response = await axiosInstance.post('/api/user/send-email', {
                from,
                to,
                subject,
                html
            });

            // Check if the response contains an error
            if (response.data.error) {
                console.log('Error:', response.data.error);
                return response.data;
            } else {
                console.log('Success:', response.data);
                return response.data;
            }
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    return (
        <ResendEmailContext.Provider value={{ emailDetails, setEmailDetails, sendEmail }}>
            {children}
        </ResendEmailContext.Provider>
    );
};

// Custom hook to access ResendEmail context
export const useResendEmail = () => useContext(ResendEmailContext);

// Export the context provider
export { ResendEmailContext, ResendEmailProvider };