// utils/deviceMonitoring.js
const initializeFirebase = require('../config/firebaseConfig');
const { getFormattedDate, deviceStatusTracker } = require('./helpers');
const { logger } = require('./logger');

const admin = initializeFirebase();
const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

const checkDeviceStatus = async (config) => {
    const now = Date.now();
    const updates = [];

    for (const [deviceKey, status] of deviceStatusTracker) {
        const [binLocation, binId] = deviceKey.split('-');
        const lastUpdate = Math.max(status.lastHeartbeat, status.lastSensorDistance);

        if (status.isOnline && (now - lastUpdate) > config.offlineThreshold) {
            status.isOnline = false;

            try {
                const binRef = sensorDataRef.child(`${binLocation}/Bin-${binId}`);
                const snapshot = await binRef.once('value');
                const currentData = snapshot.val();

                if (currentData) {
                    updates.push({
                        ref: binRef,
                        update: {
                            microProcessorStatus: 'OFF',
                            lastUpdated: getFormattedDate(),
                            sensorStatus: 'OFF',
                        }
                    });
                }
            } catch (error) {
                logger.error(`Error updating offline status for Bin-${binId} at ${binLocation}:`, error);
            }
        }
    }

    // Perform batch updates
    for (const { ref, update } of updates) {
        try {
            await ref.update(update);
            logger.info(`Successfully updated bin status in batch operation.`);
        } catch (error) {
            logger.error(`Error in batch update:`, error);
        }
    }
};

const cleanupTracker = (config) => {
    const now = Date.now();
    for (const [deviceKey, status] of deviceStatusTracker) {
        const lastUpdate = Math.max(status.lastHeartbeat, status.lastSensorDistance);
        if (now - lastUpdate > config.offlineThreshold * 2) {
            deviceStatusTracker.delete(deviceKey);
        }
    }
};

module.exports = {
    checkDeviceStatus,
    cleanupTracker
};