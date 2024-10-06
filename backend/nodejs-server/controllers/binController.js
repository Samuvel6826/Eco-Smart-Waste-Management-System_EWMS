// controllers/binController.js
const admin = require('firebase-admin');
const { binMetaDataSchema, distanceSchema, heartbeatSchema } = require('../models/binModel');
const { getFormattedDate, updateDeviceStatus } = require('../utils/helpers');
const { logger } = require('../utils/logger');

const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

exports.createBin = async (req, res) => {
    const { error, value } = binMetaDataSchema.validate(req.body);

    if (error) {
        logger.error('Validation error:', error.details);
        return res.status(400).json({ error: 'Invalid data format or missing required fields' });
    }

    const { id, binLocation } = value;
    logger.info(`Received metadata for location: ${binLocation}`);

    const binRef = sensorDataRef.child(`${binLocation}/Bin-${id}`);

    try {
        const dataToSave = {
            ...value,
            lastUpdated: getFormattedDate(),
            createdAt: getFormattedDate(),
            lastMaintenance: "",
        };

        await binRef.set(dataToSave);
        logger.info('Metadata saved to Firebase:', dataToSave);
        res.status(200).json({ message: 'Bin metadata received and saved to Firebase' });
    } catch (error) {
        logger.error(`Error saving metadata to Firebase for Bin-${id}:`, error);
        res.status(500).json({ error: 'Failed to save bin metadata to Firebase' });
    }
};

exports.updateSensorDistance = async (req, res) => {
    const { error, value } = distanceSchema.validate(req.body);
    if (error) {
        logger.error('Invalid distance data:', error.details);
        return res.status(400).json({ error: 'Invalid distance data', details: error.details });
    }

    const { id, binLocation } = value;
    const binRef = sensorDataRef.child(`${binLocation}/Bin-${id}`);

    try {
        const existingDataSnapshot = await binRef.once('value');
        const existingData = existingDataSnapshot.val();

        if (!existingData) {
            logger.error(`No existing data found for Bin-${id} at ${binLocation}`);
            return res.status(404).json({ error: 'No existing data found for this bin' });
        }

        const dataToSave = {
            ...existingData,
            ...value,
            lastUpdated: getFormattedDate(),
        };

        await binRef.set(dataToSave);
        updateDeviceStatus(binLocation, id, 'sensor-distance');
        logger.info(`Data updated for Bin-${id} at ${binLocation}`);

        res.status(200).json({ message: 'Bin data updated successfully' });
    } catch (error) {
        logger.error(`Error updating data for Bin-${id}:`, error);
        res.status(500).json({ error: 'Failed to update bin data' });
    }
};

exports.updateHeartbeat = async (req, res) => {
    const { error, value } = heartbeatSchema.validate(req.body);
    if (error) {
        logger.error('Invalid heartbeat data:', error.details);
        return res.status(400).json({ error: 'Invalid heartbeat data', details: error.details });
    }

    const { id, binLocation, microProcessorStatus } = value;
    const binRef = sensorDataRef.child(`${binLocation}/Bin-${id}`);

    try {
        await binRef.update({
            lastUpdated: getFormattedDate(),
            microProcessorStatus
        });
        updateDeviceStatus(binLocation, id, 'heartbeat');
        res.status(200).json({ message: 'Heartbeat received' });
    } catch (error) {
        logger.error(`Error updating heartbeat for Bin-${id}:`, error);
        res.status(500).json({ error: 'Failed to update heartbeat' });
    }
};