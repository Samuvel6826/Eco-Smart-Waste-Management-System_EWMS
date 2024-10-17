import { useState, useEffect, useCallback, useRef } from 'react';
import { database, ref, child, get, set } from '../../firebase.config';

const useDeviceStates = () => {
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
            const dbRef = ref(database);
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
            const dbRef = ref(database, 'Automation');
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

            const dbRef = ref(database, `Automation/${category}/${deviceId}`);
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

            const dbRef = ref(database, 'Automation');
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

const useVoiceRecognition = (deviceStates, toggleDevice, toggleAllDevices) => {
    const [isListening, setIsListening] = useState(false);
    const [recognizedCommand, setRecognizedCommand] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState(null);
    const [lastExecutedCommand, setLastExecutedCommand] = useState(null);
    const recognitionRef = useRef(null);
    const commandBufferRef = useRef([]);
    const timeoutRef = useRef(null);
    const confidenceThreshold = 0.7;

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            console.log("Stopping speech recognition...");
            recognitionRef.current.stop();
            setIsListening(false);
            clearTimeout(timeoutRef.current);
            processCommandBuffer();
        }
    }, [isListening]);

    const resetInactivityTimer = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            console.log("Inactivity detected. Stopping listening.");
            stopListening();
        }, 10000);
    }, [stopListening]);

    const getAvailableDevices = useCallback(() => {
        return Object.entries(deviceStates).flatMap(([, devices]) => Object.keys(devices));
    }, [deviceStates]);

    const findBestMatchDevice = useCallback((deviceName, availableDevices) => {
        console.log(`Finding best match for device: "${deviceName}"`);
        console.log("Available devices:", availableDevices);

        const normalizeString = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Normalize the input device name
        let normalizedDeviceName = normalizeString(deviceName);

        // Replace number words with digits
        const numberWords = { 'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'five': '5' };
        normalizedDeviceName = normalizedDeviceName.replace(/\b(one|two|three|four|five)\b/g, match => numberWords[match] || match);

        console.log(`Normalized device name: "${normalizedDeviceName}"`);

        // Find the best match
        const bestMatch = availableDevices.reduce((best, device) => {
            const normalizedDevice = normalizeString(device);
            console.log(`Comparing with normalized device: "${normalizedDevice}"`);

            // Check for exact match (ignoring hyphens)
            if (normalizedDevice === normalizedDeviceName) {
                console.log(`Exact match found: "${device}"`);
                return { device, score: 0 };
            }

            // Check for partial match
            const [deviceType, deviceNumber] = normalizedDevice.split('');
            if (normalizedDeviceName.includes(deviceType) && normalizedDeviceName.includes(deviceNumber)) {
                const score = Math.abs(normalizedDevice.length - normalizedDeviceName.length);
                console.log(`Partial match found: "${device}" with score ${score}`);
                return score < best.score ? { device, score } : best;
            }

            return best;
        }, { device: null, score: Infinity });

        if (bestMatch.device) {
            console.log(`Best match found: "${bestMatch.device}" with score ${bestMatch.score}`);
            return bestMatch.device;
        }

        console.log(`No match found for: "${deviceName}"`);
        return null;
    }, []);

    const executeCommand = useCallback((command, confidence) => {
        console.log(`Executing command: ${command} (Confidence: ${confidence})`);

        if (confidence < confidenceThreshold) {
            console.warn(`Command confidence (${confidence}) below threshold (${confidenceThreshold}). Ignoring command.`);
            setError(`Command not recognized with sufficient confidence. Please try again.`);
            return;
        }

        if (/^(stop|top) listening$/i.test(command.trim())) {
            stopListening();
            setLastExecutedCommand({ type: 'system', action: 'stop_listening' });
            return;
        }

        const availableDevices = getAvailableDevices();
        console.log(availableDevices);


        if (/turn (on|off) all/i.test(command)) {
            const state = /turn on all/i.test(command);
            toggleAllDevices(state);
            setLastExecutedCommand({ type: 'all', state });
            return;
        }

        const deviceMatch = command.match(/turn (on|off) ([\w\s-]+)/i);
        if (deviceMatch) {
            const [, action, deviceName] = deviceMatch;
            const state = action.toLowerCase() === 'on';
            const foundDevice = findBestMatchDevice(deviceName, availableDevices);

            if (foundDevice) {
                toggleDevice(foundDevice, state);
                setLastExecutedCommand({ type: 'device', device: foundDevice, state });
            } else {
                setError(`Device "${deviceName}" not found. Please try again with a valid device name.`);
            }
        } else {
            setError(`Unrecognized command: "${command}". Please try saying "turn on/off [device name]", "turn on/off all", or "stop listening".`);
        }
    }, [deviceStates, toggleDevice, toggleAllDevices, getAvailableDevices, findBestMatchDevice, stopListening]);

    const processCommandBuffer = useCallback(() => {
        const fullCommand = commandBufferRef.current.join(' ').toLowerCase().trim();
        if (fullCommand) {
            setRecognizedCommand(fullCommand);
            executeCommand(fullCommand, 1);
            commandBufferRef.current = [];
            resetInactivityTimer();
        }
    }, [executeCommand, resetInactivityTimer]);

    const initSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError(null);
                resetInactivityTimer();
            };

            recognitionRef.current.onresult = (event) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript.trim();
                const confidence = event.results[last][0].confidence;

                if (event.results[last].isFinal) {
                    commandBufferRef.current.push(transcript);
                    processCommandBuffer();
                } else {
                    setRecognizedCommand(transcript);
                }
                resetInactivityTimer();
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start();
                } else {
                    setIsListening(false);
                }
            };
        } else if (!SpeechRecognition) {
            console.error('Speech recognition is not supported in this browser.');
            setError('Speech recognition is not supported in this browser.');
        }
    }, [isListening, processCommandBuffer, resetInactivityTimer]);

    const startListening = useCallback(() => {
        const setupAndStart = async () => {
            if (!recognitionRef.current) {
                initSpeechRecognition();
            }

            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                console.error('Error accessing microphone:', err);
                setError('Unable to access the microphone. Please check your browser permissions.');
                return;
            }

            if (recognitionRef.current && !isListening) {
                setError(null);
                commandBufferRef.current = [];

                let startAttempts = 0;
                const maxAttempts = 3;

                const attemptStart = () => {
                    try {
                        recognitionRef.current.start();
                        setIsListening(true);
                        resetInactivityTimer();
                    } catch (err) {
                        console.error('Error starting speech recognition:', err);
                        startAttempts++;
                        if (startAttempts < maxAttempts) {
                            setTimeout(attemptStart, 1000);
                        } else {
                            setError('Failed to start speech recognition after multiple attempts. Please refresh the page and try again.');
                        }
                    }
                };

                attemptStart();
            }
        };

        setupAndStart();
    }, [isListening, initSpeechRecognition, resetInactivityTimer]);

    useEffect(() => {
        initSpeechRecognition();
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            clearTimeout(timeoutRef.current);
        };
    }, [initSpeechRecognition]);

    useEffect(() => {
        let intervalId;
        if (isListening) {
            intervalId = setInterval(() => {
                setAudioLevel(Math.random() * 100);
            }, 100);
        }
        return () => clearInterval(intervalId);
    }, [isListening]);

    return {
        isListening,
        startListening,
        stopListening,
        recognizedCommand,
        audioLevel,
        error,
        lastExecutedCommand,
    };
};

export { useDeviceStates, useVoiceRecognition };