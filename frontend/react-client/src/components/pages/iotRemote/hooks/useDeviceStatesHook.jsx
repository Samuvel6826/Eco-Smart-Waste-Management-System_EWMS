import { useState, useEffect, useCallback } from 'react';
import { database, databaseRef, child, get, set } from '../../../../../firebase.config';

const useDeviceStatesHook = () => {
    const [deviceStates, setDeviceStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allDevicesOn, setAllDevicesOn] = useState(false);

    const updateAllDevicesState = (states) => {
        const allOn = Object.values(states).every(category =>
            Object.values(category).every(device => device.state === 1)
        );
        setAllDevicesOn(allOn);
    };

    const fetchDeviceStates = useCallback(async () => {
        setLoading(true);
        setError(null);
        // console.log("Fetching device states from the database...");
        try {
            const dbRef = databaseRef(database);
            const snapshot = await get(child(dbRef, 'Automation'));
            if (snapshot.exists()) {
                const fetchedStates = snapshot.val();
                // console.log("Fetched device states:", fetchedStates);
                setDeviceStates(fetchedStates);
                updateAllDevicesState(fetchedStates);
                // initializeDefaultStates();
            } else {
                console.log('No device states found in the database. Initializing with default values.');
                await initializeDefaultStates();
            }
        } catch (err) {
            console.error('Failed to fetch device states:', err);
            setError('Failed to fetch device states. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setDeviceStates]);

    const initializeDefaultStates = async () => {
        console.log("Checking for existing device states...");
        try {
            const dbRef = databaseRef(database, 'Automation');
            const snapshot = await get(dbRef); // Fetch existing states
            let currentStates = {};

            // Check if data already exists
            if (snapshot.exists()) {
                console.log('Device states already initialized. Merging with existing states...');
                currentStates = snapshot.val(); // Get current states
            }

            // Define new devices to add
            const initialStates = {
                FANs: {
                    "FAN-1": { state: 0, location: "Canteen", lastUpdated: "" },
                    "FAN-2": { state: 0, location: "Lab", lastUpdated: "" }
                },
                LEDs: {
                    "LED-1": { state: 0, location: "Canteen", lastUpdated: "" },
                    "LED-2": { state: 0, location: "Lab", lastUpdated: "" },
                    "LED-3": { state: 0, location: "Library", lastUpdated: "" },
                    "LED-4": { state: 0, location: "Gym", lastUpdated: "" }
                }
            };

            // Create an object to hold merged states
            const mergedStates = {
                ...currentStates,
                ...initialStates
            };

            // Identify devices to remove
            for (const category in currentStates) {
                if (!(category in initialStates)) {
                    // If category no longer exists in initialStates, remove it from Firebase
                    delete mergedStates[category];
                } else {
                    for (const device in currentStates[category]) {
                        if (!(device in initialStates[category])) {
                            // If device no longer exists in initialStates, remove it from Firebase
                            delete mergedStates[category][device];
                        }
                    }
                }
            }

            // Now set the merged states to the database
            await set(dbRef, mergedStates);
            console.log("Device states merged and set in the database");
            setDeviceStates(mergedStates); // Update local state
            setAllDevicesOn(false);
        } catch (err) {
            console.error('Failed to initialize device states:', err);
            setError('Failed to initialize device states. Please refresh the page and try again.');
        }
    };

    const toggleDevice = useCallback(async (device, state) => {
        console.log(`Toggling ${device} to ${state ? "ON" : "OFF"}...`);
        // console.log("Current deviceStates:", JSON.stringify(deviceStates, null, 2));
        try {
            const deviceId = device; // Directly use the device ID without category

            // Find which category the device belongs to (LEDs, FANs)
            let category;
            for (const cat in deviceStates) {
                if (deviceStates[cat][deviceId]) {
                    category = cat;
                    break;
                }
            }

            if (!category) {
                throw new Error(`Device ${deviceId} not found in any category`);
            }

            const dbRef = databaseRef(database, `Automation/${category}/${deviceId}`);
            const lastUpdated = new Date().toLocaleString();
            const updatedDevice = { ...deviceStates[category][deviceId], state: state ? 1 : 0, lastUpdated };

            // console.log(`Updating device in database:`, JSON.stringify(updatedDevice, null, 2));
            await set(dbRef, updatedDevice);
            // console.log(`${device} state updated in database`);

            setDeviceStates(prev => {
                const newStates = {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        [deviceId]: updatedDevice
                    }
                };
                // console.log("New device states:", JSON.stringify(newStates, null, 2));
                updateAllDevicesState(newStates);
                return newStates;
            });
        } catch (err) {
            console.error(`Failed to toggle ${device}:`, err);
            setError(`Failed to update device state for ${device}. Please try again.`);
        }
    }, [deviceStates]);

    const toggleAllDevices = useCallback(async (state) => {
        // console.log(`Toggling all devices to ${state ? "ON" : "OFF"}...`);
        try {
            const lastUpdated = new Date().toLocaleString();
            const updatedStates = Object.entries(deviceStates).reduce((acc, [category, devices]) => {
                acc[category] = Object.entries(devices).reduce((categoryAcc, [deviceId, device]) => {
                    categoryAcc[deviceId] = { ...device, state: state ? 1 : 0, lastUpdated };
                    return categoryAcc;
                }, {});
                return acc;
            }, {});

            const dbRef = databaseRef(database, 'Automation');
            await set(dbRef, updatedStates);
            // console.log("All devices state updated in the database:", updatedStates);
            setDeviceStates(updatedStates);
            setAllDevicesOn(state);
        } catch (err) {
            console.error('Failed to toggle all devices:', err);
            setError('Failed to update all device states. Please try again.');
        }
    }, [deviceStates]);

    useEffect(() => {
        fetchDeviceStates();
    }, [fetchDeviceStates]);

    return {
        deviceStates,
        allDevicesOn,
        toggleDevice,
        toggleAllDevices,
        fetchDeviceStates,
        loading,
        error,
    };
};

export { useDeviceStatesHook };