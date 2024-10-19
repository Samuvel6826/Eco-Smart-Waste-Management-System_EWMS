import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    LinearProgress,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightControls from './LightControls';
import VoiceVisualizer from './VoiceVisualizer';
import InactivityTimer from './InactivityTimer';
import { useDeviceStatesHook } from './iotHooks/useDeviceStatesHook';
import { useVoiceRecognitionHook } from './iotHooks/useVoiceRecognitionHook';

const IotAutomationControl = () => {
    const {
        deviceStates,
        allDevicesOn,
        toggleDevice,
        toggleAllDevices,
        fetchDeviceStates,
        loading,
        error: deviceError,
    } = useDeviceStatesHook();

    const memoizedDeviceStates = useMemo(() => deviceStates, [deviceStates]);

    const memoizedToggleDevice = useCallback((device, state) => {
        console.log(`Toggling device ${device} to ${state ? 'on' : 'off'}`);
        toggleDevice(device, state);
    }, [toggleDevice]);

    const memoizedToggleAllDevices = useCallback((state) => {
        console.log(`Toggling all devices to ${state ? 'on' : 'off'}`);
        toggleAllDevices(state);
    }, [toggleAllDevices]);

    const {
        isListening,
        startListening,
        stopListening,
        recognizedCommand,
        error: voiceError,
        lastExecutedCommand,
        remainingTime,
    } = useVoiceRecognitionHook(memoizedDeviceStates, memoizedToggleDevice, memoizedToggleAllDevices);

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
        <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar>
                    <Typography variant="h5" color="white" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        IoT Automation Control
                    </Typography>
                    <Tooltip title="Refresh device states">
                        <IconButton onClick={fetchDeviceStates} color="inherit" aria-label="Refresh device states">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <LightControls
                    deviceStates={memoizedDeviceStates}
                    allDevicesOn={allDevicesOn}
                    toggleDevice={memoizedToggleDevice}
                    toggleAllDevices={memoizedToggleAllDevices}
                    loading={loading}
                    error={deviceError}
                />

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        color={isListening ? "secondary" : "primary"}
                        onClick={isListening ? stopListening : startListening}
                        startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
                        size="large"
                        aria-label={isListening ? "Stop Listening" : "Start Voice Control"}
                        sx={{
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: isListening ? '#d32f2f' : '#1976d2',
                            },
                        }}
                    >
                        {isListening ? "Stop Listening" : "Start Voice Control"}
                    </Button>
                </Box>

                <Fade in={isListening}>
                    <Box sx={{ mt: 4 }}>
                        <VoiceVisualizer isListening={isListening} />
                        <InactivityTimer remainingTime={remainingTime} />
                        {recognizedCommand && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Recognized: {recognizedCommand}
                            </Typography>
                        )}
                    </Box>
                </Fade>

                <Fade in={Boolean(recognizedCommand)}>
                    <Paper elevation={3} sx={{ mt: 4, p: 2, backgroundColor: '#e0f7fa' }}>
                        <Typography variant="h6">Recognized Command:</Typography>
                        <Typography variant="body1">{recognizedCommand}</Typography>
                    </Paper>
                </Fade>

                <Paper elevation={3} sx={{ p: 2, mt: 4, backgroundColor: '#f1f8e9' }}>
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
                        <br />
                        6. The inactivity timer will stop listening after 10 seconds of silence.
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