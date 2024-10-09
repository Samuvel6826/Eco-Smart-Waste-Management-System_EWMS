import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BinsContext = createContext();

export const useBinsContext = () => useContext(BinsContext);

export const BinsProvider = ({ children }) => {
    const [bins, setBins] = useState({}); // Initialize as an object
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]); // Add locations state
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchBins = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/list`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });

            const fetchedBins = response.data || {};
            setBins(fetchedBins); // Ensure bins is set to the fetched data

            // Get locations from the keys of fetchedBins
            const fetchedLocations = Object.keys(fetchedBins);
            setLocations(fetchedLocations); // Set locations based on keys

            setError(null);
        } catch (err) {
            console.error('Error fetching bins:', err); // Log error details
            setError(err.response?.data?.message || 'An error occurred while fetching bins.');
            setBins({}); // Reset to an empty object on error
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getBinByLocationAndId = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/getBinByLocationAndId`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setError(null);
            return response.data.data;
        } catch (err) {
            console.error('Error fetching bin:', err); // Log error details
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
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/create`, binData, {
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
            console.error('Error creating bin:', err); // Log error details
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
            const response = await axios.put(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/edit`, binData, {
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
            console.error('Error editing bin:', err); // Log error details
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
            await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/api/bin/delete`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                params: { location, id },
            });
            setBins((prevBins) => ({
                ...prevBins,
                [location]: prevBins[location].filter((bin) => bin.id !== id),
            }));
            setError(null);
        } catch (err) {
            console.error('Error deleting bin:', err); // Log error details
            setError(err.response?.data?.message || 'An error occurred while deleting the bin.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    return (
        <BinsContext.Provider
            value={{
                bins,
                loading,
                error,
                locations,
                fetchBins, // Expose fetchBins to be called externally
                getBinByLocationAndId,
                createBin,
                editBin,
                deleteBin,
            }}
        >
            {children}
        </BinsContext.Provider>
    );
};