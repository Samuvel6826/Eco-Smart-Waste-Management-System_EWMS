import React, { useState, useEffect } from 'react';
import {
    BsLightbulbFill,
    BsLightbulb,
    BsPower,
    BsExclamationTriangleFill,
    BsHouseFill,
    BsGrid
} from "react-icons/bs";

const LightControls = ({ deviceStates, allDevicesOn, toggleDevice, toggleAllDevices, loading, error }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastToggled, setLastToggled] = useState(null);
    const [categoryStates, setCategoryStates] = useState({});

    // Initialize and update category states
    useEffect(() => {
        if (deviceStates) {
            const newCategoryStates = {};
            Object.entries(deviceStates).forEach(([category, devices]) => {
                const deviceArray = Object.values(devices);
                newCategoryStates[category] = deviceArray.every(device => device.state === 1);
            });
            setCategoryStates(newCategoryStates);
        }
    }, [deviceStates]);

    // Handle toggle all devices with animation
    const handleToggleAll = () => {
        setIsAnimating(true);
        toggleAllDevices(!allDevicesOn);
        setTimeout(() => setIsAnimating(false), 600);
    };

    // Handle toggle category
    const handleToggleCategory = (category, devices) => {
        const currentState = categoryStates[category];
        const newState = !currentState;

        // Toggle all devices in the category
        Object.entries(devices).forEach(([deviceName, deviceData]) => {
            if (deviceData.state !== (newState ? 1 : 0)) {
                toggleDevice(deviceName, newState);
            }
        });

        // Update category state
        setCategoryStates(prev => ({
            ...prev,
            [category]: newState
        }));
    };

    // Handle individual device toggle with animation
    const handleToggleDevice = (deviceName, newState) => {
        setLastToggled(deviceName);
        toggleDevice(deviceName, newState);
        setTimeout(() => setLastToggled(null), 1000);
    };

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="relative">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <div className="mt-4 text-center text-sm text-gray-600">Loading devices...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in rounded-lg bg-red-50 p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <BsExclamationTriangleFill className="h-8 w-8 text-red-500" />
                    <p className="font-semibold text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (!deviceStates || Object.keys(deviceStates).length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <BsLightbulb className="h-12 w-12 text-gray-400" />
                    <p className="font-semibold text-gray-500">No devices found</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
                    >
                        Scan for Devices
                    </button>
                </div>
            </div>
        );
    }

    const activeDevicesCount = Object.entries(deviceStates).flatMap(([_, devices]) =>
        Object.values(devices).filter(device => device.state === 1)
    ).length;

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />

                <div className="relative z-10 flex flex-col gap-6">
                    {/* Title and Stats */}
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-white/10 p-3">
                                <BsLightbulbFill className={`h-6 w-6 ${allDevicesOn ? 'text-yellow-300' : 'text-gray-300'}`} />
                            </div>
                            <div>
                                <h2 className="mb-1 text-2xl font-bold text-white">Smart Lighting</h2>
                                <p className="text-sm text-blue-100">
                                    {activeDevicesCount} of {Object.values(deviceStates).flat().length} Devices Active
                                </p>
                            </div>
                        </div>

                        {/* Master Control Switch */}
                        <div className="flex items-center gap-4 rounded-full bg-white/10 px-6 py-3">
                            <span className="text-sm font-medium text-white">All Devices</span>
                            <button
                                onClick={handleToggleAll}
                                className={`group relative h-8 w-16 rounded-full transition-all duration-300 
                                    ${allDevicesOn ? 'bg-green-400' : 'bg-gray-400'}
                                    ${isAnimating ? 'scale-95' : 'scale-100'}`}
                            >
                                <span className={`absolute inset-0.5 flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300
                                    ${allDevicesOn ? 'translate-x-8' : 'translate-x-0'}`}>
                                    {allDevicesOn ?
                                        <BsPower className="h-4 w-4 text-green-400" /> :
                                        <BsPower className="h-4 w-4 text-red-400" />
                                    }
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Category Controls */}
                    <div className="flex h-full w-full items-center justify-center gap-4">
                        {Object.entries(deviceStates).map(([category, devices]) => (
                            <div
                                key={category}
                                className="w-full rounded-lg bg-white/10 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-white/10 p-2">
                                            {category.toLowerCase().includes('bedroom') ? (
                                                <BsHouseFill className="h-4 w-4 text-white" />
                                            ) : (
                                                <BsGrid className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-white">{category}</h3>
                                            <p className="text-xs text-blue-100">
                                                {Object.values(devices).filter(d => d.state === 1).length} of {Object.values(devices).length} On
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleCategory(category, devices)}
                                        className={`relative h-7 w-14 rounded-full transition-all duration-300
                                            ${categoryStates[category] ? 'bg-green-400' : 'bg-gray-400'}`}
                                    >
                                        <span
                                            className={`absolute top-0.5 h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300
                                                ${categoryStates[category] ? 'left-[calc(100%-1.65rem)]' : 'left-0.5'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Devices Table */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Device</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Control</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Voice Command</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Object.entries(deviceStates).map(([category, devices]) => (
                            Object.entries(devices).map(([device, deviceData]) => {
                                const { location, state } = deviceData;
                                const isSelected = lastToggled === device;

                                return (
                                    <tr
                                        key={device}
                                        className={`transition-all duration-300 
                                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <BsLightbulbFill
                                                    className={`h-5 w-5 transition-colors duration-300
                                                        ${state === 1 ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                                <span className="font-medium text-gray-900">{device}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {location || "Not Set"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium
                                                    ${state === 1
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'}`}>
                                                    <div className={`h-2 w-2 rounded-full ${state === 1 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    {state === 1 ? 'On' : 'Off'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleToggleDevice(device, state === 0)}
                                                    className={`relative h-7 w-14 rounded-full shadow-inner transition-all duration-300
                                                        ${state === 1 ? 'bg-green-400' : 'bg-gray-300'}
                                                        ${isSelected ? 'scale-95' : 'scale-100'}`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300
                                                            ${state === 1 ? 'left-[calc(100%-1.65rem)]' : 'left-0.5'}`}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                " Turn {state === 1 ? 'off' : 'on'} {device} "
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LightControls;