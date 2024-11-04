import React, { useState, forwardRef } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useBinsContext } from '../../contexts/BinsContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";

import { IoSettings } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaBoxArchive } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import { TiArrowSync } from "react-icons/ti";
import { HiOutlineSignal } from "react-icons/hi2";
import { HiBeaker } from "react-icons/hi2";

import DynamicBatteryIcon from "./binSettings/DynamicBatteryIcon"

// Create forwarded ref components for icons used in tooltips
const SettingsIcon = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
        <IoSettings className={`h-5 w-5 ${className || ''}`} />
    </div>
));

const DeleteIcon = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
        <MdDeleteForever className={`h-6 w-6 ${className || ''}`} />
    </div>
));

const BeakerIcon = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
        <HiBeaker className={`mb-1 h-5 w-5 text-blue-500 ${className || ''}`} />
    </div>
));

const SignalIcon = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
        <HiOutlineSignal className={`mb-1 h-5 w-5 text-blue-500 ${className || ''}`} />
    </div>
));

const SyncIcon = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
        <TiArrowSync className={`mb-1 h-5 w-5 text-blue-500 ${className || ''}`} />
    </div>
));

// Set display names for the forwarded ref components
SettingsIcon.displayName = 'SettingsIcon';
DeleteIcon.displayName = 'DeleteIcon';
BeakerIcon.displayName = 'BeakerIcon';
SignalIcon.displayName = 'SignalIcon';
SyncIcon.displayName = 'SyncIcon';

const Bin = ({ locationId, binId, binData }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { deleteBin } = useBinsContext();
    const { user } = useAuth();

    const {
        binLocation = '',
        id = '',
        binType = '',
        binLidStatus = '',
        microProcessorStatus = '',
        sensorStatus = '',
        filledBinPercentage = '',
        maxBinCapacity = '',
        binActiveStatus = '',
        lastEmptied = '',
        temperature = '',
        humidity = '',
        batteryLevel = ''
    } = binData;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'on':
            case 'closed':
                return 'green';
            case 'inactive':
            case 'off':
            case 'open':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getFillLevelGradient = (percentage) => {
        if (percentage >= 80) return 'from-red-200 to-red-500';
        if (percentage >= 50) return 'from-yellow-200 to-yellow-500';
        return 'from-green-200 to-green-500';
    };

    const formatLastEmptied = (dateString) => {
        return dayjs(dateString).format('MMM D');
    };

    const needsAttention = filledBinPercentage > 80 ||
        binLidStatus.toLowerCase() === 'open' ||
        microProcessorStatus.toLowerCase() === 'off' ||
        sensorStatus.toLowerCase() === 'off';

    const getMaintenanceStatus = () => {
        if (needsAttention) return 'Attention Required';
        if (filledBinPercentage >= 50) return 'Monitor';
        return 'Operational';
    };

    return (
        <>
            <Card className="w-[380px] bg-white transition-all duration-300 hover:shadow-lg">
                {/* Status Banner */}
                <div
                    className={`px-4 py-2 transition-colors duration-300 ${needsAttention
                        ? 'bg-gradient-to-r from-red-50 to-red-100'
                        : 'bg-gradient-to-r from-green-50 to-green-100'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${needsAttention ? 'animate-pulse bg-red-500' : 'bg-green-500'}`} />
                            <Typography className={`font-medium ${needsAttention ? 'text-red-700' : 'text-green-700'}`}>
                                {getMaintenanceStatus()}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip content="Battery Level">
                                <DynamicBatteryIcon
                                    batteryLevel={batteryLevel} // Battery percentage (0-100)
                                    isCharging={false} // Charging state
                                    isFault={false} // Fault state
                                    temperature={0} // Temperature in Celsius (optional)
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <CardBody className="p-4">
                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-xl bg-blue-50 p-2.5">
                                <FaBoxArchive className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <Typography variant="h5" className="font-bold">
                                    {id}
                                </Typography>
                                <Typography variant="small" className="flex items-center gap-1 text-gray-600">
                                    <FaMapMarkerAlt className="h-3.5 w-3.5" />
                                    {binLocation}
                                </Typography>
                            </div>
                        </div>
                        <Chip
                            size="sm"
                            variant="gradient"
                            color={getStatusColor(binActiveStatus)}
                            value={binActiveStatus}
                            className="font-medium"
                        />
                    </div>

                    {/* Capacity Section */}
                    <div className="mb-6 overflow-hidden rounded-xl bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <Typography className="font-semibold text-gray-700">
                                Fill Level
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                {maxBinCapacity} cm max
                            </Typography>
                        </div>
                        <div className="relative mb-2">
                            <div className="h-8 w-full overflow-hidden rounded-lg bg-gray-200">
                                <div
                                    className={`h-full bg-gradient-to-r ${getFillLevelGradient(filledBinPercentage)} transition-all duration-500`}
                                    style={{ width: `${filledBinPercentage}%` }}
                                >
                                    <Typography
                                        variant="small"
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white"
                                    >
                                        {filledBinPercentage}%
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-3">
                        <Tooltip content="Temperature">
                            <div className="flex flex-col items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <BeakerIcon />
                                <Typography className="text-sm font-semibold">
                                    {temperature}°C
                                </Typography>
                            </div>
                        </Tooltip>
                        <Tooltip content="Humidity">
                            <div className="flex flex-col items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <SignalIcon />
                                <Typography className="text-sm font-semibold">
                                    {humidity}%
                                </Typography>
                            </div>
                        </Tooltip>
                        <Tooltip content="Last Emptied">
                            <div className="flex flex-col items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <SyncIcon />
                                <Typography className="text-sm font-semibold">
                                    {formatLastEmptied(lastEmptied)}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    {/* System Status */}
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            <Tooltip content="Lid Status">
                                <Chip
                                    size="sm"
                                    variant="gradient"
                                    color={getStatusColor(binLidStatus)}
                                    value={`Lid ${binLidStatus}`}
                                    className="font-medium"
                                />
                            </Tooltip>
                            <Tooltip content="Sensor Status">
                                <Chip
                                    size="sm"
                                    variant="gradient"
                                    color={getStatusColor(sensorStatus)}
                                    value={`Sensor ${sensorStatus}`}
                                    className="font-medium"
                                />
                            </Tooltip>
                            <Tooltip content="Type">
                                <Chip
                                    size="sm"
                                    variant="outlined"
                                    value={`Type ${binType}`}
                                    className="font-medium"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            size="sm"
                            onClick={() => navigate(`/users/edit-bin/${locationId}/${binId}`)}
                            className="rounded-lg hover:bg-gray-100"
                        >
                            <Tooltip content="Settings">
                                <SettingsIcon />
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => setShowModal(true)}
                            className="rounded-lg hover:bg-red-50"
                        >
                            <Tooltip content="Delete">
                                <DeleteIcon />
                            </Tooltip>
                        </IconButton>
                    </div>
                </CardBody>
            </Card>

            {/* Delete Dialog */}
            <Dialog
                open={showModal}
                handler={() => setShowModal(false)}
                className="rounded-xl"
            >
                <DialogHeader className="flex items-center gap-2">
                    <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                    <Typography variant="h6">Delete Bin</Typography>
                </DialogHeader>
                <DialogBody>
                    <Typography className="text-gray-700">
                        Are you sure you want to delete bin <span className="font-medium">{id}</span>?
                        This action cannot be undone.
                    </Typography>
                </DialogBody>
                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={() => setShowModal(false)}
                        className="font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        color="red"
                        onClick={async () => {
                            await deleteBin(locationId, binId);
                            setShowModal(false);
                        }}
                        className="font-medium"
                    >
                        Delete Bin
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default React.memo(Bin);