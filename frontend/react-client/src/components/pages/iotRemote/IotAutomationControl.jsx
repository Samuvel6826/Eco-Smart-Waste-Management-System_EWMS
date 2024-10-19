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
    Grid,
    Chip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightControls from './LightControls';
import VoiceVisualizer from './VoiceVisualizer';
import InactivityTimer from './InactivityTimer';
import { useDeviceStatesHook } from './useDeviceStatesHook';
import { useVoiceRecognitionHook } from './useVoiceRecognitionHook';
import { toast } from 'react-hot-toast';

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

    const fetchDevicesData = useCallback(async () => {
        try {
            await fetchDeviceStates();
            toast.success('Device states refreshed successfully!', { icon: '✅' });
        } catch (error) {
            console.error('Failed to fetch device states:', error);
            toast.error('Failed to fetch device states. Please try again.');
        }
    }, [fetchDeviceStates]);

    useEffect(() => {
        fetchDevicesData();
    }, [fetchDevicesData]);

    useEffect(() => {
        if (deviceError) {
            toast.error(`Device Error: ${deviceError}`);
        }

        if (voiceError) {
            toast.error(`Voice Error: ${voiceError}`);
        }
    }, [deviceError, voiceError]);

    const renderLoading = () => (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress color="primary" />
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#F5F5F5', minHeight: '100vh' }}>
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', mb: 3 }}>
                <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                        IoT Automation Control
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isListening && (
                            <Chip
                                icon={<MicIcon />}
                                label="Voice Control Active"
                                color="primary"
                                variant="outlined"
                            />
                        )}

                        <Button
                            variant="contained"
                            color={isListening ? "secondary" : "primary"}
                            onClick={isListening ? stopListening : startListening}
                            startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
                            sx={{
                                transition: 'background-color 0.3s ease',
                            }}
                        >
                            {isListening ? "Stop Listening" : "Start Voice Control"}
                        </Button>

                        <Tooltip title="Refresh device states">
                            <IconButton onClick={fetchDevicesData} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {loading ? renderLoading() : (
                    <>
                        <LightControls
                            deviceStates={memoizedDeviceStates}
                            allDevicesOn={allDevicesOn}
                            toggleDevice={memoizedToggleDevice}
                            toggleAllDevices={memoizedToggleAllDevices}
                            loading={loading}
                        />

                        <Fade in={isListening}>
                            <Box sx={{ mt: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={3} sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Voice Recognition Status
                                            </Typography>
                                            <VoiceVisualizer isListening={isListening} />
                                            <InactivityTimer remainingTime={remainingTime} />
                                            {recognizedCommand && (
                                                <Typography variant="body2" sx={{ mt: 2 }}>
                                                    Recognized: {recognizedCommand}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f1f8e9' }}>
                                            <Typography variant="h6" gutterBottom>
                                                <InfoOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                                Voice Commands Guide
                                            </Typography>
                                            <Typography variant="body2">
                                                • "Turn on/off LED 1-5" - Control individual LEDs
                                                <br />
                                                • "Turn on/off Fan 1-5" - Control individual fans
                                                <br />
                                                • "Turn on/off all" - Control all devices
                                                <br />
                                                • "Stop listening" - End voice control
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default IotAutomationControl;