import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import {
    getFormattedDateNTime,
    isLoggedIn,
    validateToken,
    setAuthToken,
    isTokenExpired
} from '../../authentication/authUtils';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = () => {
            // console.log('Initializing authentication...');
            try {
                const savedUser = JSON.parse(
                    localStorage.getItem('user') || sessionStorage.getItem('user')
                );

                if (savedUser && !isTokenExpired(savedUser.token)) {
                    // console.log('User found in storage. Valid token.');
                    setUser(savedUser);
                    setAuthToken(savedUser.token);
                } else {
                    // console.log('Token expired or no user found. Logging out.');
                    handleLogout();
                }
            } catch (err) {
                // console.error('Error initializing auth:', err);
                handleLogout();
            } finally {
                // console.log('Auth initialization complete.');
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const handleLogin = useCallback(async (email, password) => {
        // console.log('Attempting to log in with email:', email);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_HOST_URL}/api/user/login`,
                {
                    email,
                    password,
                    lastLoginAt: getFormattedDateNTime(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { token, user: responseData } = response.data;

            if (!token || !responseData) {
                throw new Error('Invalid response from server');
            }

            // console.log('Login successful. Storing user and token...');
            const userData = { ...responseData, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setAuthToken(token);
            setUser(userData);
            setError(null);

            return { success: true, userData, token };
        } catch (error) {
            // console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const handleLogout = useCallback(() => {
        // console.log('Logging out...');
        setAuthToken(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        setError(null);
    }, []);

    const getAuthToken = useCallback(() => {
        // console.log('Getting auth token...');
        return user?.token || null;
    }, [user?.token]);

    const currentUserId = `${user?.role || 'Unknown'}_${user?.employeeId || 'Unknown'}_${user?.firstName || ''}_${user?.lastName || ''}`.trim();

    const contextValue = useMemo(() => ({
        user,
        currentUserId,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        getAuthToken,
        isAuthenticated: !!user, // Updated to reflect if the user is logged in
        userRole: user?.role
    }), [user, currentUserId, loading, error, handleLogin, handleLogout, getAuthToken]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}