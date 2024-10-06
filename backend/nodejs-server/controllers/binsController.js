const admin = require('firebase-admin');
const { binMetaDataSchema, distanceSchema, heartbeatSchema } = require('../models/binsModel');
const { getFormattedDate, updateDeviceStatus } = require('../utils/helpers');
const { logger } = require('../utils/logger');

const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

// Helper functions for error handling
const handleClientError = (res, message) => {
    logger.error('Client Error:', message);
    res.status(400).json({ error: message });
};

const handleServerError = (res, error) => {
    logger.error('Server Error:', error.message);
    res.status(500).json({
        error: 'Internal Server Error',
        details: error.message,
    });
};

// Helper function to find the actual location (case-insensitive)
const findActualLocation = async (location) => {
    const locationsSnapshot = await sensorDataRef.once('value');
    const locations = locationsSnapshot.val();
    return Object.keys(locations).find(
        loc => loc.toLowerCase() === location.toLowerCase()
    );
};

const createBin = async (req, res) => {
    try {
        const { error, value } = binMetaDataSchema.validate(req.body);

        if (error) {
            return handleClientError(res, 'Invalid data format or missing required fields');
        }

        const { id, binLocation } = value;
        logger.info(`Received metadata for location: ${binLocation}`);

        const actualLocation = await findActualLocation(binLocation);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);

        const dataToSave = {
            ...value,
            binLocation: actualLocation, // Use the actual location name from the database
            lastUpdated: getFormattedDate(),
            createdAt: getFormattedDate(),
            lastMaintenance: "",
        };

        await binRef.set(dataToSave);
        logger.info('Metadata saved to Firebase:', dataToSave);
        res.status(200).json({ message: 'Bin metadata received and saved to Firebase' });
    } catch (error) {
        handleServerError(res, error);
    }
};

const updateSensorDistance = async (req, res) => {
    try {
        const { error, value } = distanceSchema.validate(req.body);
        if (error) {
            return handleClientError(res, 'Invalid distance data');
        }

        const { id, binLocation } = value;
        const actualLocation = await findActualLocation(binLocation);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);

        const existingDataSnapshot = await binRef.once('value');
        const existingData = existingDataSnapshot.val();

        if (!existingData) {
            return handleClientError(res, 'No existing data found for this bin');
        }

        const dataToSave = {
            ...existingData,
            ...value,
            binLocation: actualLocation, // Use the actual location name from the database
            lastUpdated: getFormattedDate(),
        };

        await binRef.set(dataToSave);
        updateDeviceStatus(actualLocation, id, 'sensor-distance');
        logger.info(`Data updated for Bin-${id} at ${actualLocation}`);

        res.status(200).json({ message: 'Bin data updated successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
};

const updateHeartbeat = async (req, res) => {
    try {
        const { error, value } = heartbeatSchema.validate(req.body);
        if (error) {
            return handleClientError(res, 'Invalid heartbeat data');
        }

        const { id, binLocation, microProcessorStatus } = value;
        const actualLocation = await findActualLocation(binLocation);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);

        await binRef.update({
            lastUpdated: getFormattedDate(),
            microProcessorStatus,
            binLocation: actualLocation, // Use the actual location name from the database
        });
        updateDeviceStatus(actualLocation, id, 'heartbeat');
        res.status(200).json({ message: 'Heartbeat received' });
    } catch (error) {
        handleServerError(res, error);
    }
};

const getBins = async (req, res) => {
    try {
        const snapshot = await sensorDataRef.once('value');
        const bins = snapshot.val();
        res.status(200).json(bins);
    } catch (error) {
        handleServerError(res, error);
    }
};

const getBinByLocationAndId = async (req, res) => {
    try {
        const { location, id } = req.query;
        if (!location || !id) {
            return handleClientError(res, 'Both location and id are required');
        }

        const actualLocation = await findActualLocation(location);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);
        const snapshot = await binRef.once('value');
        const bin = snapshot.val();

        if (!bin) {
            return handleClientError(res, 'Bin not found');
        }

        res.status(200).json(bin);
    } catch (error) {
        handleServerError(res, error);
    }
};

const editBinByLocationAndId = async (req, res) => {
    try {
        const { location, id } = req.query;
        const updates = req.body;

        if (!location || !id) {
            return handleClientError(res, 'Both location and id are required');
        }

        const actualLocation = await findActualLocation(location);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);
        const snapshot = await binRef.once('value');
        const existingBin = snapshot.val();

        if (!existingBin) {
            return handleClientError(res, 'Bin not found');
        }

        // Ensure the location in the updates matches the actual location
        if (updates.binLocation) {
            updates.binLocation = actualLocation;
        }

        await binRef.update(updates);

        res.status(200).json({ message: 'Bin updated successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
};

const deleteBinByLocationAndId = async (req, res) => {
    try {
        const { location, id } = req.query;

        if (!location || !id) {
            return handleClientError(res, 'Both location and id are required');
        }

        const actualLocation = await findActualLocation(location);
        if (!actualLocation) {
            return handleClientError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/Bin-${id}`);
        const snapshot = await binRef.once('value');
        const existingBin = snapshot.val();

        if (!existingBin) {
            return handleClientError(res, 'Bin not found');
        }

        await binRef.remove();

        res.status(200).json({ message: 'Bin deleted successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
};

module.exports = {
    createBin,
    updateSensorDistance,
    updateHeartbeat,
    getBins,
    getBinByLocationAndId,
    editBinByLocationAndId,
    deleteBinByLocationAndId
};