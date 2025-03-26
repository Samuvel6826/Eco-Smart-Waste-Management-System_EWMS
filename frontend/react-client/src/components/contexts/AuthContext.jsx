import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import axios from 'axios';
import {
    getFormattedDateNTime,
    isLoggedIn,
    validateToken,
    setAuthToken,
    isTokenExpired
} from '../authentication/authUtils';

// Create the context
export const AuthContext = createContext(null);

// Provider component
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
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

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

    const currentUserId = `${user?.role || 'Unknown'}_${user?.employeeId || 'Unknown'}_${user?.firstName || ''}_${user?.lastName || ''}`.trim();

    const contextValue = useMemo(() => ({
        user,
        currentUserId,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        getAuthToken,
        isAuthenticated: !!user,
        userRole: user?.role
    }), [user, currentUserId, loading, error, handleLogin, handleLogout, getAuthToken]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for using the Auth context
export function useAuthHook() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthHook must be used within an AuthProvider');
    }
    return context;
}