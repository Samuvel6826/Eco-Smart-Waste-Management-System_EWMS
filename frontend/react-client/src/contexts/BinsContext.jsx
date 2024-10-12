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

    const axiosConfig = useMemo(() => ({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
    }), []);

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
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/list`, axiosConfig);

            const fetchedBins = response.data || {};
            const processedBins = {};
            Object.keys(fetchedBins).forEach(location => {
                processedBins[location] = Array.isArray(fetchedBins[location])
                    ? fetchedBins[location]
                    : [fetchedBins[location]];
            });

            setBins(processedBins);
            setLocations(Object.keys(processedBins));
            setError(null);
        } catch (err) {
            handleError(err, 'An error occurred while fetching bins.');
            setBins({});
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosConfig]);

    const getBinByLocationAndId = useCallback((locationId, binId) => {
        const locationBins = bins['Trash-Bins'][locationId];
        if (!locationBins) return null;
        const foundBin = locationBins[binId];
        return foundBin || null;
    }, [bins]);

    const createBin = useCallback(async (binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/create/`, binData, axiosConfig);
            const newBin = response.data.data;
            setBins(prevBins => ({
                ...prevBins,
                [newBin.binLocation]: [...(prevBins[newBin.binLocation] || []), newBin],
            }));
            setLocations(prevLocations =>
                prevLocations.includes(newBin.binLocation)
                    ? prevLocations
                    : [...prevLocations, newBin.binLocation]
            );
            setError(null);
            return newBin;
        } catch (err) {
            handleError(err, 'An error occurred while creating the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosConfig]);

    const editBin = useCallback(async (location, id, binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/edit/`, binData, {
                ...axiosConfig,
                params: { location, id },
            });
            const updatedBin = response.data.data;
            setBins(prevBins => ({
                ...prevBins,
                [location]: prevBins[location].map(bin =>
                    bin.id === id ? updatedBin : bin
                ),
            }));
            setError(null);
            return updatedBin;
        } catch (err) {
            handleError(err, 'An error occurred while editing the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosConfig]);

    const deleteBin = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/delete/`, {
                ...axiosConfig,
                params: { location, id },
            });
            setBins(prevBins => {
                const updatedBins = { ...prevBins };
                updatedBins[location] = updatedBins[location].filter(bin => bin.id !== id);
                if (updatedBins[location].length === 0) {
                    delete updatedBins[location];
                    setLocations(prevLocations => prevLocations.filter(loc => loc !== location));
                }
                return updatedBins;
            });
            setError(null);
        } catch (err) {
            handleError(err, 'An error occurred while deleting the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosConfig]);

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