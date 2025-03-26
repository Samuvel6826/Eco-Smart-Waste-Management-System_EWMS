import React, { createContext, useState, useCallback, useMemo, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { database, databaseRef, onValue, off } from '../../../firebase.config';
import { useAuthHook } from './AuthContext';

// Create the context
export const BinsContext = createContext(null);

// Provider component
export function BinsProvider({ children }) {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, logout } = useAuthHook();
    const listenersSetup = useRef(false);
    const activeListeners = useRef({});

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_SERVER_HOST_URL,
            withCredentials: true,
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

    // ...existing code...

    const handleError = useCallback((error) => {
        console.error('Error in BinsContext:', error);
        if (error.response) {
            if (error.response.status === 404) {
                setError('No bins found for this location. The location might be empty or not exist.');
                toast.error('No bins found for this location.');
            } else {
                setError(`Server error: ${error.response.data.message || 'Unknown error occurred'}`);
                toast.error('Failed to fetch bins. Please try again later.');
            }
        } else if (error.request) {
            setError('Unable to reach the server. Please check your internet connection.');
            toast.error('Network error. Please check your connection.');
        } else {
            setError('An unexpected error occurred. Please try again.');
            toast.error('An unexpected error occurred.');
        }
    }, []);

    // ...existing code...

    const setupFirebaseListeners = useCallback(() => {
        if (listenersSetup.current) {
            console.log('Listeners already set up, skipping');
            return;
        }
        console.log('Setting up Firebase listeners');
        const binsRef = databaseRef(database, 'Trash-Bins');
        const listener = onValue(binsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setBins(data);
            } else {
                console.warn('Received null data from Firebase');
            }
        }, (error) => {
            console.error('Error in Firebase listener:', error);
        });
        activeListeners.current['Trash-Bins'] = listener;
        listenersSetup.current = true;
    }, []);

    const fetchBins = useCallback(async (forceRefresh = false) => {
        // ...existing code...
        if (!user) {
            console.log('No user logged in, skipping bin fetch');
            return;
        }
        if (listenersSetup.current && !forceRefresh) {
            console.log('Listeners already set up, using existing data');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/bin/list');
            const fetchedBins = response.data || {};
            setBins(fetchedBins);
            setError(null);

            setupFirebaseListeners();
        } catch (err) {
            console.error('Error fetching bins:', err);
            handleError(err);
            setBins({});
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance, setupFirebaseListeners]);

    // ...existing code for other functions...

    const refreshBins = useCallback(() => fetchBins(true), [fetchBins]);

    const fetchBinsByLocation = useCallback(async (location) => {
        // ...existing code...
        console.log(`Fetching bins for location: ${location}`);
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/api/bin/supervisor/assigned-bins/', {
                params: { location },
            });
            const fetchedBins = response.data.bins;
            console.log(`Fetched ${fetchedBins.length} bins for ${location}:`, fetchedBins);

            if (fetchedBins && fetchedBins.length > 0) {
                const formattedBins = {
                    [location]: fetchedBins.reduce((acc, bin) => {
                        acc[bin.id] = bin;
                        return acc;
                    }, {})
                };

                setBins(prevBins => ({
                    ...prevBins,
                    ...formattedBins
                }));

                console.log(`Updated bins state for ${location}:`, formattedBins);
                toast.success(`Successfully fetched ${fetchedBins.length} bins for ${location}`);
            } else {
                console.log(`No bins found for ${location}`);
                setBins(prevBins => ({
                    ...prevBins,
                    [location]: {}
                }));
                setError(`No bins found for ${location}`);
                toast.info(`No bins found for ${location}`);
            }
        } catch (err) {
            console.error(`Error fetching bins for ${location}:`, err);
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, handleError]);

    const getBinByLocationAndId = useCallback((locationId, binId) => {
        return bins[locationId]?.[binId] || null;
    }, [bins]);

    // ...other bin functions...

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
            handleError(err);
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
            handleError(err);
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
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [user, handleError, axiosInstance]);

    const cleanupListeners = useCallback(() => {
        console.log('Cleaning up Firebase listeners');
        Object.entries(activeListeners.current).forEach(([path, listener]) => {
            const binRef = databaseRef(database, path);
            off(binRef, 'value', listener);
            console.log(`Removed listener for: ${path}`);
        });
        activeListeners.current = {};
        listenersSetup.current = false;
    }, []);

    const value = useMemo(() => ({
        bins,
        loading,
        error,
        fetchBins,
        refreshBins,
        fetchBinsByLocation,
        getBinByLocationAndId,
        createBin,
        editBin,
        deleteBin,
        cleanupListeners,
    }), [bins, loading, error, fetchBins, refreshBins, fetchBinsByLocation, getBinByLocationAndId, createBin, editBin, deleteBin, cleanupListeners]);

    return (
        <BinsContext.Provider value={value}>
            {children}
        </BinsContext.Provider>
    );
}

// Custom hook for using the Bins context
export function useBinsHook() {
    const context = useContext(BinsContext);
    if (!context) {
        throw new Error('useBinsHook must be used within a BinsProvider');
    }
    return context;
}
