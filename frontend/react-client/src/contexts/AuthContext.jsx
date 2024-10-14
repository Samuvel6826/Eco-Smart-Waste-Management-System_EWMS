import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeToken } from '../components/authentication/authUtils'; // Adjust the path as necessary

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const decodedUser = decodeToken(token);
                    if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
                        setUser(decodedUser);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    } else {
                        console.warn('Token expired, logging out');
                        await logout();
                    }
                } catch (error) {
                    console.error('Invalid token:', error);
                    await logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_HOST_URL}/api/user/login`,
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            const { token } = response.data;
            sessionStorage.setItem('token', token);
            const decodedUser = decodeToken(token);
            setUser(decodedUser);
            setError(null);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return decodedUser;
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.message || 'An error occurred during login');
            throw error;
        }
    };

    const logout = async () => {
        sessionStorage.removeItem('token');
        setUser(null);
        setError(null);
        delete axios.defaults.headers.common['Authorization'];
        // Optionally, you can add a call to your backend to invalidate the token
        // await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/logout`);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;