import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const BinsContext = createContext();

export const useBinsContext = () => useContext(BinsContext);

export const BinsProvider = ({ children }) => {
    const [bins, setBins] = useState({});
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const handleError = useCallback((err, customMessage) => {
        console.error(customMessage, err);
        const errorMessage = err.response?.data?.message || customMessage;
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
    }, []);

    const fetchBins = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/list`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });

            const fetchedBins = response.data || {};
            setBins(fetchedBins);
            const fetchedLocations = Object.keys(fetchedBins);
            setLocations(fetchedLocations);
            setError(null);
        } catch (err) {
            handleError(err, 'An error occurred while fetching bins.');
            setBins({});
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const getBinByLocationAndId = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/getBinByLocationAndId/`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setError(null);
            return response.data.data;
        } catch (err) {
            handleError(err, 'An error occurred while fetching the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const createBin = useCallback(async (binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/create/`, binData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            setBins((prevBins) => ({
                ...prevBins,
                [response.data.data.location]: [
                    ...(prevBins[response.data.data.location] || []),
                    response.data.data,
                ],
            }));
            setError(null);
            return response.data.data;
        } catch (err) {
            handleError(err, 'An error occurred while creating the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const editBin = useCallback(async (location, id, binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/edit/`, binData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setBins((prevBins) => ({
                ...prevBins,
                [location]: prevBins[location].map((bin) => (bin.id === id ? response.data.data : bin)),
            }));
            setError(null);
            return response.data.data;
        } catch (err) {
            handleError(err, 'An error occurred while editing the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const deleteBin = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/delete/`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setBins((prevBins) => ({
                ...prevBins,
                [location]: prevBins[location].filter((bin) => bin.id !== id),
            }));
            setError(null);
        } catch (err) {
            handleError(err, 'An error occurred while deleting the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const value = useMemo(() => ({
        bins,
        loading,
        error,
        locations,
        fetchBins,
        getBinByLocationAndId,
        createBin,
        editBin,
        deleteBin,
    }), [bins, loading, error, locations, fetchBins, getBinByLocationAndId, createBin, editBin, deleteBin]);

    return (
        <BinsContext.Provider value={value}>
            {children}
        </BinsContext.Provider>
    );
};