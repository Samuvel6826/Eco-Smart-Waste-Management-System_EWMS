// utils/helpers.js
const { DateTime } = require('luxon');

exports.getFormattedDate = () => {
    return DateTime.now().setZone('Asia/Kolkata').toFormat('dd/MM/yyyy, hh:mm:ss a').toUpperCase();
};

const deviceStatusTracker = new Map();

exports.updateDeviceStatus = (binLocation, binId, type) => {
    const deviceKey = `${binLocation}-${binId}`;
    const now = DateTime.now();

    if (!deviceStatusTracker.has(deviceKey)) {
        deviceStatusTracker.set(deviceKey, {
            lastHeartbeat: null,
            lastSensorDistance: null,
            isOnline: false
        });
    }

    const status = deviceStatusTracker.get(deviceKey);
    if (type === 'heartbeat') {
        status.lastHeartbeat = now.toISO(); // Store as ISO string
    } else if (type === 'sensor-distance') {
        status.lastSensorDistance = now.toISO(); // Store as ISO string
    }
    status.isOnline = true;
};

exports.deviceStatusTracker = deviceStatusTracker;