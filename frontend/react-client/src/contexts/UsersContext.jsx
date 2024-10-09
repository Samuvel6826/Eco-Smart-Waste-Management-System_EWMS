import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logOut } = useAuth();

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
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while fetching users.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [logOut]);

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
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while fetching the user.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [logOut]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/create`, userData);

            if (res.status === 201) {
                setUsers(prevUsers => [...prevUsers, res.data.data]);
                toast.success('User created successfully');
                return res.data.data;
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while creating the user.');
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }, []);

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
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while updating the user.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [logOut]);

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
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while deleting the user.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [logOut]);

    const assignBinsToUser = useCallback(async (employeeId, binLocations) => {
        setLoading(true);
        try {
            const res = await axios.patch(`${import.meta.env.VITE_SERVER_HOST_URL}/api/user/assign-binlocations/employeeId`,
                { binLocations },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                    params: { employeeId },
                }
            );

            if (res.status === 200) {
                setUsers(prevUsers => prevUsers.map(user => user.employeeId === employeeId ? { ...user, assignedBins: res.data.data.assignedBins } : user));
                toast.success('Bins assigned successfully');
                return res.data.data;
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while assigning bins to the user.');
            toast.error(error.response?.data?.message);
            if (error.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoading(false);
        }
    }, [logOut]);

    const value = {
        users,
        loading,
        error,
        fetchUsers,
        getUserByEmployeeId,
        createUser,
        editUser,
        deleteUser,
        assignBinsToUser
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);