import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { IoIosMic, IoIosMicOff } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";
import LightControls from './LightControls';
import VoiceVisualizer from './VoiceVisualizer';
import InactivityTimer from './InactivityTimer';
import { useDeviceStatesHook } from './hooks/useDeviceStatesHook';
import { useVoiceRecognitionHook } from './hooks/useVoiceRecognitionHook';
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
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <header className="border-b border-gray-300 bg-white shadow">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <h1 className="text-2xl font-bold text-blue-600">IoT Automation Control</h1>
                    <div className="flex items-center gap-4">
                        {isListening && (
                            <div className="flex items-center rounded-full border border-blue-600 px-3 py-1 text-blue-600">
                                <IoIosMic className="mr-2" />
                                Voice Control Active
                            </div>
                        )}
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`px-4 py-2 text-white rounded-md transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                                } flex items-center gap-2`}
                        >
                            {isListening ? <IoIosMicOff /> : <IoIosMic />}
                            {isListening ? "Stop Listening" : "Start Voice Control"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {loading ? renderLoading() : (
                    <>
                        <LightControls
                            deviceStates={memoizedDeviceStates}
                            allDevicesOn={allDevicesOn}
                            toggleDevice={memoizedToggleDevice}
                            toggleAllDevices={memoizedToggleAllDevices}
                            loading={loading}
                        />

                        {isListening && (
                            <div className="mt-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="rounded-lg bg-white p-6 shadow-md">
                                        <h2 className="mb-4 text-lg font-semibold">Voice Recognition Status</h2>
                                        <VoiceVisualizer isListening={isListening} />
                                        <InactivityTimer remainingTime={remainingTime} />
                                        {recognizedCommand && (
                                            <p className="mt-4 text-sm">
                                                Recognized: <strong>{recognizedCommand}</strong>
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-lg bg-white p-6 shadow-md">
                                        <h2 className="mb-4 flex items-center text-lg font-semibold">
                                            <FaCircleInfo className="mr-2" /> Voice Commands Guide
                                        </h2>
                                        <p className="text-sm">
                                            • "Turn on/off LED 1-5" - Control individual LEDs
                                            <br />
                                            • "Turn on/off Fan 1-5" - Control individual fans
                                            <br />
                                            • "Turn on/off all" - Control all devices
                                            <br />
                                            • "Stop listening" - End voice control
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default IotAutomationControl;