import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BinContext = createContext();

export const useBinContext = () => useContext(BinContext);

export const BinsProvider = ({ children }) => {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchBins = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bins/list`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            setBins(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bins:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching bins.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getBinByLocationAndId = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bins/getBinByLocationAndId`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setError(null);
            return response.data.data;
        } catch (err) {
            console.error('Error fetching bin:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching the bin.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const createBin = useCallback(async (binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bins/create`, binData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            setBins((prevBins) => [...prevBins, response.data.data]);
            setError(null);
            return response.data.data;
        } catch (err) {
            console.error('Error creating bin:', err);
            setError(err.response?.data?.message || 'An error occurred while creating the bin.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const editBin = useCallback(async (location, id, binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bins/edit`, binData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setBins((prevBins) => prevBins.map((bin) => (bin.id === id ? response.data.data : bin)));
            setError(null);
            return response.data.data;
        } catch (err) {
            console.error('Error editing bin:', err);
            setError(err.response?.data?.message || 'An error occurred while editing the bin.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteBin = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bins/delete`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setBins((prevBins) => prevBins.filter((bin) => bin.id !== id));
            setError(null);
        } catch (err) {
            console.error('Error deleting bin:', err);
            setError(err.response?.data?.message || 'An error occurred while deleting the bin.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    return (
        <BinContext.Provider
            value={{
                bins,
                loading,
                error,
                fetchBins,
                getBinByLocationAndId,
                createBin,
                editBin,
                deleteBin,
            }}
        >
            {children}
        </BinContext.Provider>
    );
};