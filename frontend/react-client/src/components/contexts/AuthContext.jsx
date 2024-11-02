import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
    getFormattedDateNTime,
    getUserFromSession,
    isLoggedIn,
    getAuthToken,
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
        const initializeAuth = async () => {
            const validatedUser = validateToken();
            if (validatedUser) {
                setUser(validatedUser);
                const token = getAuthToken();
                setAuthToken(token);
            } else {
                await logout();
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

            // Update the user data with the formatted lastLoginBy
            const userData = {
                ...responseData
            };

            console.table(userData)

            // Set auth token (this will handle both sessionStorage and axios headers)
            setAuthToken(token);
            // Store user data in session storage
            sessionStorage.setItem('user', JSON.stringify(userData));
            // Update the user state
            setUser(userData);

            return {
                success: true,
                userData,
                token
            };
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const logout = async () => {
        setAuthToken(null);
        sessionStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            setUser,
            login,
            logout,
            isAuthenticated: isLoggedIn(),
            userRole: user?.role
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;