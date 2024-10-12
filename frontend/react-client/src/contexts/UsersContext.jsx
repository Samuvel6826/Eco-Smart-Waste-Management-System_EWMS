import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useAuth();

    const axiosConfig = useMemo(() => ({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
    }), []);

    const handleError = useCallback((err) => {
        const message = err.response?.data?.message || 'An unexpected error occurred.';
        setError(message);
        toast.error(message);
        if (err.response?.status === 401) {
            logout();
        }
    }, [logout]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/list`, axiosConfig);

            if (res.status === 200) {
                setUsers(res.data.data);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

    const getUserByEmployeeId = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/get/employeeId`, {
                ...axiosConfig,
                params: { employeeId },
            });

            if (res.status === 200) {
                return res.data.data;
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/create`, userData, axiosConfig);

            if (res.status === 201) {
                setUsers(prevUsers => [...prevUsers, res.data.data]);
                toast.success('User created successfully');
                return res.data.data;
            }
        } catch (err) {
            console.log('Token:', sessionStorage.getItem('token'));
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

    const editUser = useCallback(async (employeeId, userData) => {
        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/edit/employeeId`, userData, {
                ...axiosConfig,
                params: { employeeId },
            });

            if (res.status === 200) {
                setUsers(prevUsers => prevUsers.map(user => user.employeeId === employeeId ? res.data.data : user));
                toast.success('User updated successfully');
                return res.data.data;
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

    const deleteUser = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/delete/employeeId`, {
                ...axiosConfig,
                params: { employeeId },
            });

            if (res.status === 200) {
                setUsers(prevUsers => prevUsers.filter(user => user.employeeId !== employeeId));
                toast.success('User deleted successfully');
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

    const assignBinsToUser = useCallback(async (employeeId, binLocations, supervisorId) => {
        setLoading(true);
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_SERVER_HOST_URL}/api/user/assign-binlocations/employeeId`,
                { bins: binLocations, supervisorId },
                {
                    ...axiosConfig,
                    params: { employeeId },
                }
            );

            if (res.status === 200) {
                setUsers(prevUsers => prevUsers.map(user => user.employeeId === employeeId ? { ...user, assignedBins: res.data.data.assignedBins } : user));
                toast.success('Bins assigned successfully');
                return res.data.data;
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [handleError, axiosConfig]);

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
    }), [users, loading, error, fetchUsers, getUserByEmployeeId, createUser, editUser, deleteUser, assignBinsToUser]);

    return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsersContext = () => useContext(UsersContext);