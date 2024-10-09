import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeToken } from '../components/authentication/authUtils'; // Assume this utility function exists

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            // Instead of verifying, we'll decode the token and set the user
            try {
                const decodedUser = decodeToken(token);
                setUser(decodedUser);
            } catch (error) {
                console.error('Invalid token:', error);
                sessionStorage.removeItem('token');
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
            return decodedUser;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);