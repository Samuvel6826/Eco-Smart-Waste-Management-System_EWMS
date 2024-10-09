// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeToken } from '../components/authentication/authUtils'; // Adjust the path as necessary

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = decodeToken(token);
                setUser(decodedUser);
            } catch (error) {
                console.error('Invalid token:', error);
                sessionStorage.removeItem('token');
                setError(error); // Set error state
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/login`, { email, password });
            const { token } = response.data;
            sessionStorage.setItem('token', token);
            const decodedUser = decodeToken(token);
            setUser(decodedUser);
            setError(null); // Clear error on successful login
            return decodedUser;
        } catch (error) {
            console.error('Login failed:', error);
            setError(error); // Set error state
            throw error;
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
        setError(null); // Clear error on logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);