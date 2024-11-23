const initializeFirebase = require('../config/firebaseConfig');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { logger: customLogger } = require('../utils/logger'); // Import the logger

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Initialize Firebase and database references
const admin = initializeFirebase();
const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

const MONITORING_CONFIG = {
    offlineThreshold: 20000, // Mark as offline after 20 seconds
    monitoringInterval: 5000, // Check every 5 seconds
    cleanupInterval: 3600000, // Cleanup every 1 hour
    requestTimeout: 30000 // Stop monitoring after 30 seconds of inactivity
};

// Track the status of devices
const deviceStatusTracker = new Map();
let monitoringIntervalId; // Store the monitoring interval ID
let requestTimerId; // Store the request timer ID

// Format date for Firebase updates
const getFormattedDate = () => {
    return dayjs().tz('Asia/Kolkata').format('DD/MM/YYYY, hh:mm:ss A').toUpperCase();
};

// Update the status of a device
const updateDeviceStatus = (binLocation, binId, type, sensorStatus) => {
    if (!binLocation || !binId) {
        customLogger.error(`Error: Missing binLocation or binId. binLocation=${binLocation}, binId=${binId}`);
        return;
    }

    const deviceKey = `${binLocation}#${binId}`;
    const now = Date.now();

    // Initialize device status if it doesn't exist
    if (!deviceStatusTracker.has(deviceKey)) {
        deviceStatusTracker.set(deviceKey, {
            lastHeartbeat: 0,
            lastSensorDistance: 0,
            isOnline: false,
            sensorStatus: 'OFF'
        });
        customLogger.info(`Initialized status for device: ${deviceKey}`);
    }

    const status = deviceStatusTracker.get(deviceKey);

    // Update the appropriate timestamp based on type
    if (type === 'heartbeat') {
        status.lastHeartbeat = now;
    } else if (type === 'sensor-distance') {
        status.lastSensorDistance = now;
    } else {
        customLogger.warn(`Unknown update type: ${type} for device: ${deviceKey}`);
    }

    status.isOnline = true;

    // Update sensor status if provided
    if (sensorStatus) {
        status.sensorStatus = sensorStatus;
    }

    if (!monitoringIntervalId) {
        startMonitoring();
    }

    resetRequestTimer();

    customLogger.info(`Updating Firebase: binLocation=${binLocation}, binId=${binId}, isOnline=${status.isOnline}, sensorStatus=${status.sensorStatus}`);
    updateFirebaseStatus(binLocation, binId, status.isOnline, status.sensorStatus)
        .catch((error) => {
            customLogger.error(`Failed to update Firebase for binLocation=${binLocation}, binId=${binId}:`, error);
        });
};

// Update Firebase status for a given bin
const updateFirebaseStatus = async (binLocation, binId, isOnline, sensorStatus) => {
    if (!binId || !binLocation) {
        customLogger.error(`Missing binId or binLocation: binId=${binId}, binLocation=${binLocation}`);
        return; // Stop further execution if these are missing
    }

    const binRef = sensorDataRef.child(`${binLocation}/${binId}`);
    try {
        const updateData = {
            microProcessorStatus: isOnline ? 'ON' : 'OFF',
            lastUpdated: getFormattedDate(),
        };

        // Only update sensorStatus if it's provided
        if (sensorStatus) {
            updateData.sensorStatus = sensorStatus;
        }

        await binRef.update(updateData);
        customLogger.info(`Updated status for ${binId} at ${binLocation}: ${JSON.stringify(updateData)}`);
    } catch (error) {
        customLogger.error(`Error updating status for ${binId} at ${binLocation}:`, error);
    }
};

// Check the status of all devices
const checkDeviceStatus = async () => {
    const now = Date.now();
    customLogger.info(`Checking device status at ${getFormattedDate()}`);

    const updatePromises = [];

    for (const [deviceKey, status] of deviceStatusTracker) {
        const [binLocation, binId] = deviceKey.split('#');

        if (!binId) {
            customLogger.error(`Invalid binId derived from deviceKey=${deviceKey}`);
            continue;
        }

        const lastUpdate = Math.max(status.lastHeartbeat || 0, status.lastSensorDistance || 0);
        const timeSinceLastUpdate = now - lastUpdate;

        if (status.isOnline) {
            if (timeSinceLastUpdate > MONITORING_CONFIG.offlineThreshold) {
                status.isOnline = false;
                customLogger.info(`Device ${deviceKey} is now offline. Updating Firebase...`);
                updatePromises.push(updateFirebaseStatus(binLocation, binId, false, 'OFF'));
            } else {
                customLogger.info(`Device ${deviceKey} is still online.`);
            }
        } else {
            customLogger.info(`Device ${deviceKey} was already offline.`);
        }
    }

    await Promise.all(updatePromises);
};

// Start the monitoring process
const startMonitoring = () => {
    customLogger.info('Starting device monitoring...');
    monitoringIntervalId = setInterval(checkDeviceStatus, MONITORING_CONFIG.monitoringInterval);
};

// Stop the monitoring process
const stopMonitoring = () => {
    customLogger.info('Stopping device monitoring...');
    if (monitoringIntervalId) {
        clearInterval(monitoringIntervalId);
        monitoringIntervalId = null; // Reset the interval ID
    }
};

// Reset the request timer
const resetRequestTimer = () => {
    if (requestTimerId) {
        clearTimeout(requestTimerId);
    }

    // Set a new timeout to stop monitoring after a period of inactivity
    requestTimerId = setTimeout(() => {
        customLogger.info('No new requests for a while. Stopping monitoring...');
        stopMonitoring();
    }, MONITORING_CONFIG.requestTimeout);
};

// Handle incoming sensor requests
const handleNewSensorRequest = (binLocation, binId, type) => {
    updateDeviceStatus(binLocation, binId, type); // Update device status
    // Monitoring continues unless the device is marked offline
};

// Clean up offline devices
const cleanupTracker = () => {
    customLogger.info('Starting tracker cleanup...');
    const now = Date.now();
    let cleanedCount = 0;

    // Clean up devices that have been offline for too long
    for (const [deviceKey, status] of deviceStatusTracker) {
        const lastUpdate = Math.max(status.lastHeartbeat || 0, status.lastSensorDistance || 0);
        if (now - lastUpdate > MONITORING_CONFIG.offlineThreshold * 2) {
            deviceStatusTracker.delete(deviceKey);
            customLogger.info(`Cleaned up device from tracker: ${deviceKey}`);
            cleanedCount++;
        }
    }
    customLogger.info(`Cleanup finished. Removed ${cleanedCount} devices.`);
};

// Periodically clean up old devices
setInterval(cleanupTracker, MONITORING_CONFIG.cleanupInterval);

// Export necessary functions for external use
module.exports = {
    startMonitoring,
    updateDeviceStatus,
    getFormattedDate,
    MONITORING_CONFIG,
    handleNewSensorRequest // Export the new function to handle incoming requests
};