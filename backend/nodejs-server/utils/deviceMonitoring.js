const initializeFirebase = require('../config/firebaseConfig');
const { DateTime } = require('luxon');
const { logger: customLogger } = require('../utils/logger'); // Import the logger

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
    return DateTime.now().setZone('Asia/Kolkata').toFormat('dd/MM/yyyy, hh:mm:ss a').toUpperCase();
};

// Update the status of a device
const updateDeviceStatus = (binLocation, binId, type) => {
    if (!binLocation || !binId) {
        customLogger.error(`Error: Missing binLocation or binId. binLocation=${binLocation}, binId=${binId}`);
        return; // Early return if parameters are missing
    }

    const deviceKey = `${binLocation}#${binId}`;
    const now = Date.now();

    // Initialize device status if it doesn't exist
    if (!deviceStatusTracker.has(deviceKey)) {
        deviceStatusTracker.set(deviceKey, {
            lastHeartbeat: 0,
            lastSensorDistance: 0,
            isOnline: false
        });
        customLogger.info(`Initialized status for device: ${deviceKey}`);
    }

    const status = deviceStatusTracker.get(deviceKey);

    // Update the appropriate timestamp based on type
    if (type === 'heartbeat') {
        status.lastHeartbeat = now; // Update heartbeat time
    } else if (type === 'sensor-distance') {
        status.lastSensorDistance = now; // Update sensor distance time
    }

    // Mark device as online
    status.isOnline = true;

    // Start monitoring if it hasn't started yet
    if (!monitoringIntervalId) {
        startMonitoring(); // Start monitoring
    }

    // Reset request timer
    resetRequestTimer();

    // Log before updating Firebase
    customLogger.info(`Before updating Firebase in updateDeviceStatus: binLocation=${binLocation}, binId=${binId}, isOnline=${status.isOnline}`);
    updateFirebaseStatus(binLocation, binId, true)
        .catch((error) => {
            customLogger.error(`Failed to update Firebase for binLocation=${binLocation}, binId=${binId}:`, error);
        });
};

// Update Firebase status for a given bin
const updateFirebaseStatus = async (binLocation, binId, isOnline) => {
    if (!binId || !binLocation) {
        customLogger.error(`Missing binId or binLocation: binId=${binId}, binLocation=${binLocation}`);
        return; // Stop further execution if these are missing
    }

    const binRef = sensorDataRef.child(`${binLocation}/${binId}`);
    try {
        await binRef.update({
            microProcessorStatus: isOnline ? 'ON' : 'OFF',
            sensorStatus: isOnline ? 'ON' : 'OFF',
            lastUpdated: getFormattedDate(),
        });
        customLogger.info(`Updated status for ${binId} at ${binLocation}: ${isOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
        customLogger.error(`Error updating status for ${binId} at ${binLocation}:`, error);
    }
};

// Check the status of all devices
const checkDeviceStatus = async () => {
    const now = Date.now(); // Get the current timestamp in milliseconds
    customLogger.info(`Checking device status at ${getFormattedDate()}`);

    // Use an array to store update promises
    const updatePromises = [];

    for (const [deviceKey, status] of deviceStatusTracker) {
        const [binLocation, binId] = deviceKey.split('#'); // Destructure for better readability

        if (!binId) {
            customLogger.error(`Invalid binId derived from deviceKey=${deviceKey}`);
            continue; // Skip to the next iteration if binId is invalid
        }

        // Determine the last update time considering both timestamps
        const lastUpdate = Math.max(status.lastHeartbeat || 0, status.lastSensorDistance || 0);
        const timeSinceLastUpdate = now - lastUpdate;

        // customLogger.info(`Device Key: ${deviceKey}, Last Update: ${lastUpdate}, Now: ${now}, Time Since Last Update: ${timeSinceLastUpdate}ms`);

        if (status.isOnline) {
            if (timeSinceLastUpdate > MONITORING_CONFIG.offlineThreshold) {
                // Mark device as offline if the last update exceeds the threshold
                status.isOnline = false;
                customLogger.info(`Device ${deviceKey} is now offline. Updating Firebase...`);
                // Store the promise to update Firebase status
                updatePromises.push(updateFirebaseStatus(binLocation, binId, false));
            } else {
                customLogger.info(`Device ${deviceKey} is still online.`);
            }
        } else {
            customLogger.info(`Device ${deviceKey} was already offline.`);
        }
    }

    // Wait for all Firebase updates to finish
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