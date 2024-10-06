// utils/helpers.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

exports.getFormattedDate = () => {
    return dayjs().tz('Asia/Kolkata').format('DD/MM/YYYY, hh:mm:ss A').toUpperCase();
};

const deviceStatusTracker = new Map();

exports.updateDeviceStatus = (binLocation, binId, type) => {
    const deviceKey = `${binLocation}-${binId}`;
    const now = Date.now();

    if (!deviceStatusTracker.has(deviceKey)) {
        deviceStatusTracker.set(deviceKey, {
            lastHeartbeat: 0,
            lastSensorDistance: 0,
            isOnline: false
        });
    }

    const status = deviceStatusTracker.get(deviceKey);
    if (type === 'heartbeat') {
        status.lastHeartbeat = now;
    } else if (type === 'sensor-distance') {
        status.lastSensorDistance = now;
    }
    status.isOnline = true;
};

exports.deviceStatusTracker = deviceStatusTracker;

