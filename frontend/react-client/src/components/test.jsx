import React, { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Tooltip,
    Fade,
    CircularProgress,
    Paper,
    Snackbar,
    Alert,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightControls from './LightControls';
import VoiceVisualizer from './VoiceVisualizer';
import { useDeviceStates, useVoiceRecognition } from './IotControlHooks';

const IotAutomationControl = () => {
    const {
        deviceStates,
        allDevicesOn,
        toggleDevice,
        toggleAllDevices,
        fetchDeviceStates,
        loading,
        error: deviceError,
    } = useDeviceStates();

    const memoizedDeviceStates = useMemo(() => deviceStates, [deviceStates]);

    useEffect(() => {
        console.log("Device states updated:", memoizedDeviceStates);
    }, [memoizedDeviceStates]);

    const {
        isListening,
        startListening,
        stopListening,
        recognizedCommand,
        audioLevel,
        error: voiceError,
    } = useVoiceRecognition(memoizedDeviceStates, toggleDevice, toggleAllDevices);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');

    useEffect(() => {
        if (deviceError || voiceError) {
            setSnackbarMessage(deviceError || voiceError);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }, [deviceError, voiceError]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading device states...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
            <AppBar position="static" color="default" elevation={0}>
                <Toolbar>
                    <Typography variant="h5" color="primary" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        IoT Automation Control
                    </Typography>
                    <Tooltip title="Refresh device states">
                        <IconButton onClick={fetchDeviceStates} color="primary" aria-label="Refresh device states">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <LightControls
                    deviceStates={deviceStates}
                    allDevicesOn={allDevicesOn}
                    toggleDevice={toggleDevice}
                    toggleAllDevices={toggleAllDevices}
                />

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        color={isListening ? "secondary" : "primary"}
                        onClick={isListening ? stopListening : startListening}
                        startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
                        size="large"
                        aria-label={isListening ? "Stop Listening" : "Start Voice Control"}
                    >
                        {isListening ? "Stop Listening" : "Start Voice Control"}
                    </Button>
                </Box>

                <Fade in={isListening}>
                    <Box>
                        <VoiceVisualizer audioLevel={audioLevel} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Current Audio Level: {audioLevel.toFixed(2)}
                        </Typography>
                    </Box>
                </Fade>

                <Fade in={Boolean(recognizedCommand)}>
                    <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
                        <Typography variant="h6">Recognized Command:</Typography>
                        <Typography variant="body1">{recognizedCommand}</Typography>
                    </Paper>
                </Fade>

                <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        <InfoOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        How to Use
                    </Typography>
                    <Typography variant="body1">
                        1. Use the switches to manually control individual devices or all devices at once.
                        <br />
                        2. Click the "Start Voice Control" button to use voice commands.
                        <br />
                        3. Speak one of the available commands to control the devices (e.g., "Turn on LED 1" or "Turn off all devices").
                        <br />
                        4. The recognized command will be displayed, and the corresponding action will be performed.
                        <br />
                        5. Click "Stop Listening" or say "Stop listening" to end voice control.
                    </Typography>
                </Paper>
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default IotAutomationControl;







import { database, ref, child, get, set } from '../../firebase.config';




const useDeviceStates = () => {
    const [deviceStates, setDeviceStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allDevicesOn, setAllDevicesOn] = useState(false);

    const fetchDeviceStates = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching device states from the database...");
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'Automation'));
            if (snapshot.exists()) {
                const fetchedStates = snapshot.val();
                console.log("Fetched device states:", fetchedStates);
                setDeviceStates(fetchedStates);
                updateAllDevicesState(fetchedStates);
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
    }, []);

    const initializeDefaultStates = async () => {
        console.log("Initializing default states for all devices...");
        try {
            const dbRef = ref(database, 'Automation');
            const initialStates = {
                FANs: {
                    "FAN-1": { state: 0, location: "Main Hall", lastUpdated: "" },
                    "FAN-2": { state: 0, location: "", lastUpdated: "" }
                },
                LEDs: {
                    "LED-1": { state: 0, location: "Main Hall", lastUpdated: "" },
                    "LED-2": { state: 0, location: "Corridor", lastUpdated: "" },
                    "LED-3": { state: 0, location: "Gym Area", lastUpdated: "" },
                    "LED-4": { state: 0, location: "Library", lastUpdated: "" }
                }
            };
            await set(dbRef, initialStates);
            console.log("Initial states set in the database");
            setDeviceStates(initialStates);
            setAllDevicesOn(false);
        } catch (err) {
            console.error('Failed to initialize device states:', err);
            setError('Failed to initialize device states. Please refresh the page and try again.');
        }
    };

    const updateAllDevicesState = (states) => {
        const allOn = Object.values(states).every(category =>
            Object.values(category).every(device => device.state === 1)
        );
        setAllDevicesOn(allOn);
    };

    const toggleDevice = useCallback(async (device, state) => {
        console.log(`Toggling ${device} to ${state ? "ON" : "OFF"}...`);
        console.log("Current deviceStates:", JSON.stringify(deviceStates, null, 2));
        try {
            const [category, ...deviceParts] = device.split('-');
            const deviceId = deviceParts.join('-');
            console.log(`Category: ${category}, DeviceId: ${deviceId}`);

            if (!deviceStates[category]) {
                throw new Error(`Category ${category} not found in deviceStates`);
            }

            if (!deviceStates[category][deviceId]) {
                throw new Error(`Device ${deviceId} not found in category ${category}`);
            }

            const dbRef = ref(database, `Automation/${category}/${deviceId}`);
            const lastUpdated = new Date().toLocaleString();
            const updatedDevice = { ...deviceStates[category][deviceId], state: state ? 1 : 0, lastUpdated };

            console.log(`Updating device in database:`, JSON.stringify(updatedDevice, null, 2));
            await set(dbRef, updatedDevice);
            console.log(`${device} state updated in database`);

            setDeviceStates(prev => {
                const newStates = {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        [deviceId]: updatedDevice
                    }
                };
                console.log("New device states:", JSON.stringify(newStates, null, 2));
                updateAllDevicesState(newStates);
                return newStates;
            });
        } catch (err) {
            console.error(`Failed to toggle ${device}:`, err);
            setError(`Failed to update device state for ${device}. Please try again.`);
        }
    }, [deviceStates]);

    const toggleAllDevices = useCallback(async (state) => {
        console.log(`Toggling all devices to ${state ? "ON" : "OFF"}...`);
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
            console.log("All devices state updated in the database:", updatedStates);
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