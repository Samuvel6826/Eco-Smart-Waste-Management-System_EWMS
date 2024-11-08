import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
    getFormattedDateNTime,
    isLoggedIn,
    validateToken,
    setAuthToken,
    isTokenExpired
} from '../authentication/authUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = () => {
            // Load user from localStorage or sessionStorage
            const savedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));

            if (savedUser && !isTokenExpired(savedUser.token)) {
                setUser(savedUser);
                setAuthToken(savedUser.token); // Set axios headers
            } else {
                // Clear any invalid data from storage
                logout();
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
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

            // Save user data in localStorage (or use sessionStorage)
            localStorage.setItem('user', JSON.stringify(userData));
            setAuthToken(token);
            setUser(userData);

            return { success: true, userData, token };
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setAuthToken(null);
        localStorage.removeItem('user'); // Also remove from sessionStorage if needed
        sessionStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    const getAuthToken = () => {
        return user?.token || null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            getAuthToken,
            isAuthenticated: isLoggedIn(),
            userRole: user?.role
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;