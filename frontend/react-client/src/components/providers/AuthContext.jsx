// AuthContext.jsx
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    getFormattedDateNTime,
    isLoggedIn,
    validateToken,
    setAuthToken,
    isTokenExpired
} from '../../authentication/authUtils';

// Create context with null initial value
export const AuthContext = createContext(null);

// Named function for the provider
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const savedUser = JSON.parse(
                    localStorage.getItem('user') || sessionStorage.getItem('user')
                );

                if (savedUser && !isTokenExpired(savedUser.token)) {
                    setUser(savedUser);
                    setAuthToken(savedUser.token);
                } else {
                    handleLogout();
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [handleLogout]);

    const handleLogin = useCallback(async (email, password) => {
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

            const userData = { ...responseData, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setAuthToken(token);
            setUser(userData);
            setError(null);

            return { success: true, userData, token };
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const handleLogout = useCallback(() => {
        setAuthToken(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        setError(null);
    }, []);

    const getAuthToken = useCallback(() => {
        return user?.token || null;
    }, [user?.token]);

    const contextValue = useMemo(() => ({
        user,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        getAuthToken,
        isAuthenticated: isLoggedIn(),
        userRole: user?.role
    }), [
        user,
        loading,
        error,
        handleLogin,
        handleLogout,
        getAuthToken
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}