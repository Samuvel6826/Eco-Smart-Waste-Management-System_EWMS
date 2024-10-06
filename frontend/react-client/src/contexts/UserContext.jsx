// UserContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUserAuth } from './UserAuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logOut } = useUserAuth();
    const token = sessionStorage.getItem('token');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200) {
                setUsers(res.data.data);
                toast.success(res.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while fetching users.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [token, logOut]);

    const value = {
        users,
        loading,
        error,
        fetchUsers
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);