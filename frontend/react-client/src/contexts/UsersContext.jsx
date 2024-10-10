import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useAuth();

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
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/list`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            if (res.status === 200) {
                setUsers(res.data.data);
                toast.success(res.data.message);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    const getUserByEmployeeId = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/get/employeeId`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
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
    }, [logout]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/create`, userData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                }
            });

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
    }, [handleError]);

    const editUser = useCallback(async (employeeId, userData) => {
        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/edit/employeeId`, userData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
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
    }, [logout]);

    const deleteUser = useCallback(async (employeeId) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/delete/employeeId`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
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
    }, [logout]);

    const assignBinsToUser = useCallback(async (employeeId, binLocations, supervisorId) => {
        setLoading(true);
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_SERVER_HOST_URL}/api/user/assign-binlocations/employeeId`,
                { bins: binLocations, supervisorId },  // Include both bins and supervisorId in the request body
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                    params: { employeeId },  // employeeId passed as a query parameter
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
    }, [logout]);

    const value = {
        users,
        loading,
        error,
        fetchUsers,
        getUserByEmployeeId,
        createUser,
        editUser,
        deleteUser,
        assignBinsToUser,
    };

    return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsersContext = () => useContext(UsersContext);