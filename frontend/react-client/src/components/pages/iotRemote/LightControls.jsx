import React from 'react';
import { BsLightbulbFill, BsLightbulb } from "react-icons/bs";

const LightControls = ({ deviceStates, allDevicesOn, toggleDevice, toggleAllDevices, loading, error }) => {
    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-center font-semibold text-red-600">
                {error}
            </p>
        );
    }

    if (!deviceStates || Object.keys(deviceStates).length === 0) {
        return (
            <p className="text-center font-semibold">
                No devices found.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-center font-semibold">Device</th>
                        <th className="px-4 py-2 text-center font-semibold">Location</th>
                        <th className="px-4 py-2 text-center font-semibold">Status</th>
                        <th className="px-4 py-2 text-center font-semibold">Switch</th>
                        <th className="px-4 py-2 text-center font-semibold">Voice Command</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(deviceStates).map(([category, devices]) => (
                        Object.entries(devices).map(([device, deviceData]) => {
                            const { location, state } = deviceData;
                            return (
                                <tr key={`${device}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">{device}</td>
                                    <td className="px-4 py-2 text-center">{location || "Unknown Location"}</td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center">
                                            <span className="mr-2">
                                                {state === 1 ? 'On' : 'Off'}
                                            </span>
                                            {state === 1 ? (
                                                <BsLightbulbFill className="text-yellow-500" />
                                            ) : (
                                                <BsLightbulb className="text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                            checked={state === 1}
                                            onChange={() => toggleDevice(`${device}`, state === 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-sm">{`Turn on/off ${device}`}</span>
                                    </td>
                                </tr>
                            );
                        })
                    ))}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-center font-semibold">
                            All Devices
                        </td>
                        <td className="px-4 py-2 text-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={allDevicesOn}
                                onChange={() => toggleAllDevices(!allDevicesOn)}
                            />
                        </td>
                        <td className="px-4 py-2 text-center">
                            <span className="text-sm">Turn on/off all devices</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default LightControls;