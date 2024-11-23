import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthHook } from './hooks/useAuthHook';
import { usePushNotificationsHook } from './hooks/usePushNotificationsHook';
import { UsersContext } from '../UsersContext';

export function UsersProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useAuthHook();
    const { sendPushNotification } = usePushNotificationsHook();

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_SERVER_HOST_URL,
            withCredentials: true,  // Use withCredentials instead of credentials
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

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/user/create', userData);
            toast.success(res.data.message);
            return res.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const editUser = useCallback(async (employeeId, userData) => {
        setLoading(true);
        try {
            const res = await axiosInstance.put('/api/user/edit', userData, {
                params: { employeeId }
            });
            toast.success(res.data.message);
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const assignBinsToUser = useCallback(async (supervisorId, assignedBinLocations) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/user/assign-binlocations', {
                supervisorId,
                assignedBinLocations
            });

            // Send notification
            await sendPushNotification(
                {
                    title: 'EWMS Push Notification',
                    body: `You have been assigned ${assignedBinLocations.length} bin locations`,
                    notificationType: "Assign"
                }
            );

            toast.success(res.data.message);
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError, sendPushNotification]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/user/list');
            setUsers(res.data.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const getUserByEmployeeId = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/user/get', {
                params: { employeeId }
            });
            return res.data.data;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const deleteUser = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axiosInstance.delete('/api/user/delete', {
                params: { employeeId }
            });
            toast.success(res.data.message);
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const fetchAssignedBinLocations = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/user/employee/assigned-bin-locations', {
                params: { employeeId },
            });
            return res.data.assignedBinLocations;
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const changePassword = useCallback(async (employeeId, password, confirmPassword) => {
        setLoading(true);
        try {
            const res = await axiosInstance.put('/api/user/change-password',
                { employeeId, password, confirmPassword }
            );
            toast.success(res.data.message);
            return res.data;
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
        assignBinsToUser,
        fetchAssignedBinLocations,
        changePassword
    }), [
        users,
        loading,
        error,
        fetchUsers,
        getUserByEmployeeId,
        createUser,
        editUser,
        deleteUser,
        assignBinsToUser,
        fetchAssignedBinLocations,
        changePassword
    ]);

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
}