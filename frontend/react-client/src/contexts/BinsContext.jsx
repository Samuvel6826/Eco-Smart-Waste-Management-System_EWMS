import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const BinsContext = createContext();

export const useBinsContext = () => useContext(BinsContext);

export const BinsProvider = ({ children }) => {
    const [bins, setBins] = useState({});
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

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('Unauthorized access detected. Logging out.');
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [logout]);

    const handleError = useCallback((error) => {
        console.error('Error in BinsContext:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
                setError('No bins found for this location. The location might be empty or not exist.');
                toast.error('No bins found for this location.');
            } else {
                setError(`Server error: ${error.response.data.message || 'Unknown error occurred'}`);
                toast.error('Failed to fetch bins. Please try again later.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            setError('Unable to reach the server. Please check your internet connection.');
            toast.error('Network error. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            setError('An unexpected error occurred. Please try again.');
            toast.error('An unexpected error occurred.');
        }
    }, []);

    const fetchBins = useCallback(async () => {
        if (!user) {
            console.log('No user logged in, skipping bin fetch');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/bin/list');
            const fetchedBins = response.data || {};
            setBins(fetchedBins);
            setError(null);
        } catch (err) {
            console.error('Error fetching bins:', err);
            handleError(err, 'An error occurred while fetching bins.');
            setBins({});
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance]);

    const fetchBinsByLocation = useCallback(async (location) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/api/bin/supervisor/assigned-bins/', {
                params: { location },
            });
            const fetchedBins = response.data.bins;
            if (fetchedBins && fetchedBins.length > 0) {
                setBins(prevBins => ({
                    ...prevBins,
                    [location]: fetchedBins
                }));
                toast.success(`Successfully fetched ${fetchedBins.length} bins for ${location}`);
            } else {
                setBins(prevBins => ({
                    ...prevBins,
                    [location]: []
                }));
                setError(`No bins found for ${location}`);
                toast.info(`No bins found for ${location}`);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const getBinByLocationAndId = useCallback((locationId, binId) => {
        return bins[locationId]?.[binId] || null;
    }, [bins]);

    const createBin = useCallback(async (binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/bin/create/', binData);
            const newBin = response.data.data;
            setBins(prevBins => ({
                ...prevBins,
                [newBin.binLocation]: {
                    ...(prevBins[newBin.binLocation] || {}),
                    [newBin.id]: newBin
                }
            }));
            setError(null);
            return newBin;
        } catch (err) {
            handleError(err, 'An error occurred while creating the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance]);

    const editBin = useCallback(async (location, id, binData) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axiosInstance.put('/api/bin/edit/', binData, {
                params: { location, id },
            });
            const updatedBin = response.data.data;
            setBins(prevBins => ({
                ...prevBins,
                [location]: {
                    ...prevBins[location],
                    [id]: updatedBin
                }
            }));
            setError(null);
            return updatedBin;
        } catch (err) {
            handleError(err, 'An error occurred while editing the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance]);

    const deleteBin = useCallback(async (location, id) => {
        if (!user) return;
        setLoading(true);
        try {
            await axiosInstance.delete('/api/bin/delete/', {
                params: { location, id },
            });
            setBins(prevBins => {
                const updatedBins = { ...prevBins };
                if (updatedBins[location]) {
                    // eslint-disable-next-line no-unused-vars
                    const { [id]: removed, ...remainingBins } = updatedBins[location];
                    if (Object.keys(remainingBins).length === 0) {
                        delete updatedBins[location];
                    } else {
                        updatedBins[location] = remainingBins;
                    }
                }
                return updatedBins;
            });
            setError(null);
        } catch (err) {
            handleError(err, 'An error occurred while deleting the bin.');
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance]);

    const value = useMemo(() => ({
        bins,
        loading,
        error,
        fetchBins,
        fetchBinsByLocation,
        getBinByLocationAndId,
        createBin,
        editBin,
        deleteBin,
    }), [bins, loading, error, fetchBins, fetchBinsByLocation, getBinByLocationAndId, createBin, editBin, deleteBin]);

    return (
        <BinsContext.Provider value={value}>
            {children}
        </BinsContext.Provider>
    );
};

export default BinsProvider;