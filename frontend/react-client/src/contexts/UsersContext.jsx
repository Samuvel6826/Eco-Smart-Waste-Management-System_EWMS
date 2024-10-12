import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, logout } = useAuth();

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_SERVER_HOST_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        instance.interceptors.request.use((config) => {
            const token = sessionStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        return instance;
    }, []);

    const handleError = useCallback((err) => {
        const message = err.response?.data?.message || 'An unexpected error occurred.';
        setError(message);
        toast.error(message);
        console.error('API Error:', err.response?.data, err.message);
        if (err.response?.status === 401) {
            console.log('Unauthorized access detected. Logging out.');
            logout();
        }
    }, [logout]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/user/list');
            setUsers(res.data.data);
            // console.log('Users fetched successfully:', res.data.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const getUserByEmployeeId = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/api/user/${employeeId}`);
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/user/create', userData);
            toast.success('User created successfully');
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const editUser = useCallback(async (userId, userData) => {
        setLoading(true);
        try {
            const res = await axiosInstance.put(`/api/user/${userId}`, userData);
            toast.success('User updated successfully');
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const deleteUser = useCallback(async (userId) => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/api/user/${userId}`);
            toast.success('User deleted successfully');
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const assignBinsToUser = useCallback(async (userId, binIds) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post(`/api/user/${userId}/assign-bins`, { binIds });
            toast.success('Bins assigned successfully');
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const value = useMemo(() => ({
        users,
        loading,
        error,
        fetchUsers,
        getUserByEmployeeId,
        createUser,
        editUser,
        deleteUser,
        assignBinsToUser
    }), [users, loading, error, fetchUsers, getUserByEmployeeId, createUser, editUser, deleteUser, assignBinsToUser]);

    return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsersContext = () => useContext(UsersContext);