import { useState, useEffect, useCallback, useRef } from 'react';
import { database, ref, child, get, set, update } from '../../firebase.config';

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
    const confidenceThreshold = 0.7;

    const getAvailableDevices = useCallback(() => {
        const devices = Object.entries(deviceStates).flatMap(([category, devices]) =>
            Object.keys(devices).map(deviceId => deviceId)
        );
        console.log("Available devices:", devices);
        return devices;
    }, [deviceStates]);

    const findBestMatchDevice = useCallback((deviceName, availableDevices) => {
        console.log(`Finding best match for device: ${deviceName}`);
        const normalizedDeviceName = deviceName.trim().toLowerCase().replace(/\s+/g, '');

        const matchDevice = (device) => {
            const normalizedDevice = device.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedDevice.includes(normalizedDeviceName) || normalizedDeviceName.includes(normalizedDevice);
        };

        const matches = availableDevices.filter(matchDevice);

        if (matches.length > 0) {
            console.log(`Matches found: ${matches.join(', ')}`);
            const bestMatch = matches.reduce((a, b) => a.length <= b.length ? a : b);
            console.log(`Best match: ${bestMatch}`);
            return bestMatch;
        }

        console.log(`No match found for: ${deviceName}`);
        return null;
    }, []);

    const executeCommand = useCallback((command, confidence) => {
        console.log(`Executing command: ${command} (Confidence: ${confidence})`);

        if (confidence < confidenceThreshold) {
            console.warn(`Command confidence (${confidence}) below threshold (${confidenceThreshold}). Ignoring command.`);
            setError(`Command not recognized with sufficient confidence. Please try again.`);
            return;
        }

        const availableDevices = getAvailableDevices();

        if (/turn (on|off) all/i.test(command)) {
            const state = /turn on all/i.test(command);
            console.log(`Toggling all devices to ${state ? 'ON' : 'OFF'}`);
            toggleAllDevices(state);
            setLastExecutedCommand({ type: 'all', state });
            return;
        }

        const deviceMatch = command.match(/turn (on|off) ([\w\s-]+)/i);
        if (deviceMatch) {
            const [, action, deviceName] = deviceMatch;
            const state = action.toLowerCase() === 'on';

            console.log(`Parsed command - Action: ${action}, Device: ${deviceName}`);

            const foundDevice = findBestMatchDevice(deviceName, availableDevices);

            if (foundDevice) {
                console.log(`Toggling device: ${foundDevice} to ${state ? 'ON' : 'OFF'}`);
                toggleDevice(foundDevice, state);
                setLastExecutedCommand({ type: 'device', device: foundDevice, state });
            } else {
                console.warn(`Device not found: ${deviceName}`);
                setError(`Device "${deviceName}" not found. Please try again.`);
            }
        } else {
            console.warn(`Unrecognized command: ${command}`);
            setError(`Unrecognized command: "${command}". Please try again.`);
        }
    }, [deviceStates, toggleDevice, toggleAllDevices, getAvailableDevices, findBestMatchDevice]);

    const processCommandBuffer = useCallback(() => {
        const fullCommand = commandBufferRef.current.join(' ').toLowerCase().trim();
        if (fullCommand) {
            console.log(`Processing command buffer: ${fullCommand}`);
            setRecognizedCommand(fullCommand);
            // Assuming a confidence of 1 for final results. In a real-world scenario, 
            // you might want to calculate an average confidence from interim results.
            executeCommand(fullCommand, 1);
            commandBufferRef.current = [];
        }
    }, [executeCommand]);

    const initSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                console.log("Speech recognition started");
                setIsListening(true);
                setError(null);
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
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'no-speech') {
                    setError('No speech detected. Please try again.');
                } else {
                    setError(`Speech recognition error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                console.log("Speech recognition ended");
                setIsListening(false);
            };
        } else if (!SpeechRecognition) {
            console.error('Speech recognition is not supported in this browser.');
            setError('Speech recognition is not supported in this browser.');
        }
    }, [processCommandBuffer]);

    const updateAudioLevel = useCallback(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 2048;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const getAudioLevel = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
                    setAudioLevel(average);
                    requestAnimationFrame(getAudioLevel);
                };
                getAudioLevel();
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                setError('Unable to access the microphone. Please check your settings.');
            });
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            initSpeechRecognition();
        }
        if (recognitionRef.current && !isListening) {
            console.log("Starting speech recognition...");
            setError(null);
            commandBufferRef.current = [];
            recognitionRef.current.start();
            updateAudioLevel(); // Add this to start audio level updates
        }
    }, [isListening, initSpeechRecognition]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            console.log("Stopping speech recognition...");
            recognitionRef.current.stop();
            processCommandBuffer(); // Process any remaining commands
        }
    }, [isListening, processCommandBuffer]);

    useEffect(() => {
        initSpeechRecognition();
        return () => {
            if (recognitionRef.current) {
                // console.log("Cleaning up speech recognition");
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [initSpeechRecognition]);

    useEffect(() => {
        let intervalId;
        if (isListening) {
            intervalId = setInterval(() => {
                const newAudioLevel = Math.random() * 100;
                setAudioLevel(newAudioLevel);
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