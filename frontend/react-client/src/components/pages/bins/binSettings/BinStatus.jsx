import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Tooltip,
    IconButton
} from "@material-tailwind/react";
import {
    FaBatteryFull,
    FaThermometerHalf,
    FaWater,
    FaChartLine,
    FaClock,
    FaPowerOff,
    FaCog,
    FaTrash,
    FaBell,
    FaHistory
} from 'react-icons/fa';
import { MetricCard, StatusIndicator, TimelineEvent } from "./BinSettingsUtils"

export const BinStatus = ({ binData }) => {
    return (
        <div className="space-y-8">
            {/* Metrics Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    icon={FaBatteryFull}
                    value={`${binData?.batteryLevel || 0}%`}
                    label="Battery Level"
                    alert={binData?.batteryLevel < 20 ? "Low battery!" : null}
                />
                <MetricCard
                    icon={FaThermometerHalf}
                    value={`${binData?.temperature || 0}°C`}
                    label="Temperature"
                    alert={binData?.temperature > 40 ? "High temperature!" : null}
                />
                <MetricCard
                    icon={FaWater}
                    value={`${binData?.humidity || 0}%`}
                    label="Humidity"
                    alert={binData?.humidity > 80 ? "High humidity!" : null}
                />
                <MetricCard
                    icon={FaChartLine}
                    value={`${binData?.filledBinPercentage || 0}%`}
                    label="Fill Level"
                    alert={binData?.filledBinPercentage > 90 ? "Bin almost full!" : null}
                />
            </div>

            {/* System Status Section */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Typography variant="h5" color="blue-gray">
                                System Status
                            </Typography>
                            <Typography color="gray" className="mt-1 font-normal">
                                Current status of all system components
                            </Typography>
                        </div>
                        <div className="flex gap-2">
                            <Tooltip content="System Settings">
                                <IconButton variant="text" color="blue-gray">
                                    <FaCog className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="View Alerts">
                                <IconButton variant="text" color="blue-gray">
                                    <FaBell className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="px-4">
                    <div className="flex flex-col gap-4">
                        <StatusIndicator
                            status={binData?.binActiveStatus === "Active"}
                            label="Bin Status"
                        />
                        <StatusIndicator
                            status={binData?.microProcessorStatus === "ON"}
                            label="Microprocessor"
                        />
                        <StatusIndicator
                            status={binData?.sensorStatus === "ON"}
                            label="Sensors"
                        />
                        <StatusIndicator
                            status={binData?.binLidStatus === "CLOSED"}
                            label="Lid Status"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Timeline Section */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Activity Timeline
                        </Typography>
                        <Tooltip content="View History">
                            <IconButton variant="text" color="blue-gray">
                                <FaHistory className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </CardHeader>
                <CardBody className="px-4">
                    <div className="space-y-4">
                        <TimelineEvent
                            icon={FaClock}
                            label="Created"
                            timestamp={binData?.createdAt}
                        />
                        <TimelineEvent
                            icon={FaClock}
                            label="Last Updated"
                            timestamp={binData?.lastUpdated}
                        />
                        <TimelineEvent
                            icon={FaPowerOff}
                            label="Last Maintenance"
                            timestamp={binData?.lastMaintenance}
                        />
                        <TimelineEvent
                            icon={FaTrash}
                            label="Last Emptied"
                            timestamp={binData?.lastEmptied}
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default BinStatus;