const admin = require('firebase-admin');
const { binMetaDataSchema, distanceSchema, heartbeatSchema } = require('../models/binModel');
const { getFormattedDate, updateDeviceStatus } = require('../utils/deviceMonitoring');
const { logger: customLogger } = require('../utils/logger');
const { handleClientError, handleServerError, handleNotFoundError, handleDuplicateError } = require('../middlewares/errorHandlers');

// Firebase references
const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

// Enhanced location finder with caching
let locationCache = {};
const findActualLocation = async (location) => {
    const lowercaseLocation = location.toLowerCase();
    if (locationCache[lowercaseLocation]) {
        return locationCache[lowercaseLocation];
    }

    const locationsSnapshot = await sensorDataRef.once('value');
    const locations = locationsSnapshot.val();
    const actualLocation = Object.keys(locations).find(
        loc => loc.toLowerCase() === lowercaseLocation
    );

    if (actualLocation) {
        locationCache[lowercaseLocation] = actualLocation;
    }
    return actualLocation;
};

const createBin = async (req, res) => {
    try {
        // Validate input using Joi schema
        const { error, value } = binMetaDataSchema.validate(req.body);
        if (error) {
            return handleClientError(res, 'Invalid data format or missing required fields');
        }

        const { id, binLocation } = value;
        customLogger.info(`Attempting to create new bin with ID: ${id} at location: ${binLocation}`);

        // Reference the location in Firebase
        const binRef = sensorDataRef.child(`${binLocation}/${id}`);
        const existingBin = await binRef.once('value');

        // Check if bin already exists
        if (existingBin.exists()) {
            return handleDuplicateError(res, `Bin with ID ${id} already exists at location ${binLocation}`);
        }

        // Data to save with default values and timestamps
        const dataToSave = {
            ...value,
            lastUpdated: getFormattedDate(),
            createdAt: getFormattedDate(),
            lastEmptied: "",
            temperature: value.temperature || "0",
            humidity: value.humidity || "0",
            batteryLevel: value.batteryLevel || "0"
        };

        // Save data to Firebase
        await binRef.set(dataToSave);
        customLogger.info('New bin metadata saved to Firebase:', dataToSave);

        // Respond with success
        res.status(201).json({
            status: 'success',
            message: 'Bin created successfully',
            data: dataToSave
        });
    } catch (error) {
        customLogger.error('Error creating bin:', error);
        handleServerError(res, error);
    }
};

const updateSensorDistance = async (req, res) => {
    try {
        customLogger.info('Incoming request body:', req.body);

        const { error, value } = distanceSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return handleClientError(res, `Invalid distance data: ${errorMessages.join(', ')}`);
        }

        const { id, binLocation, sensorStatus } = value;
        customLogger.info(`Updating sensor distance for bin location: ${binLocation} and ID: ${id}`);

        const actualLocation = await findActualLocation(binLocation);
        if (!actualLocation) {
            return handleNotFoundError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
        const existingDataSnapshot = await binRef.once('value');
        const existingData = existingDataSnapshot.val();

        if (!existingData) {
            return handleNotFoundError(res, 'No existing data found for this bin');
        }

        // Compare and prepare fields to update
        const fieldsToUpdate = {};
        let hasChanges = false;

        Object.keys(value).forEach(key => {
            if (value[key] !== existingData[key]) {
                fieldsToUpdate[key] = value[key];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            fieldsToUpdate.lastUpdated = getFormattedDate();

            customLogger.info('Fields to be updated:', fieldsToUpdate);

            await binRef.update(fieldsToUpdate);
            customLogger.info('Bin data updated successfully');

            updateDeviceStatus(binLocation, id, 'sensor-distance', sensorStatus);

            const updatedData = { ...existingData, ...fieldsToUpdate };

            res.status(200).json({
                status: 'success',
                message: 'Bin data updated successfully',
                data: updatedData
            });
        } else {
            customLogger.info('No changes detected. Skipping update.');
            res.status(200).json({
                status: 'success',
                message: 'No changes were necessary',
                data: existingData
            });
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const updateHeartbeat = async (req, res) => {
    try {
        customLogger.info('Incoming heartbeat request body:', req.body);

        const { error, value } = heartbeatSchema.validate(req.body);
        if (error) {
            return handleClientError(res, 'Invalid heartbeat data');
        }

        const { id, binLocation } = value;
        customLogger.info(`Updating heartbeat for bin location: ${binLocation} and ID: ${id}`);

        const actualLocation = await findActualLocation(binLocation);
        if (!actualLocation) {
            return handleNotFoundError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
        const existingDataSnapshot = await binRef.once('value');
        const existingData = existingDataSnapshot.val();

        if (!existingData) {
            return handleNotFoundError(res, 'No existing data found for this bin');
        }

        const dataToSave = {
            ...existingData,
            ...value,
            lastUpdated: getFormattedDate(),
        };

        customLogger.info('Heartbeat data to be saved:', dataToSave);

        await binRef.update(dataToSave);
        customLogger.info('Heartbeat updated successfully');

        updateDeviceStatus(binLocation, id, 'heartbeat');
        res.status(200).json({ message: 'Heartbeat updated successfully', data: dataToSave });
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
            return handleNotFoundError(res, 'Location not found');
        }

        const binSnapshot = await sensorDataRef.child(`${actualLocation}/${id}`).once('value');
        const binData = binSnapshot.val();
        if (!binData) {
            return handleNotFoundError(res, 'No bin found with this ID and location');
        }

        res.status(200).json(binData);
    } catch (error) {
        handleServerError(res, error);
    }
};

const getBinsBySupervisorAssignedLocations = async (req, res) => {
    try {
        const location = req.query.location;
        if (!location) {
            return handleClientError(res, 'Location is required');
        }

        const bins = await fetchBinsFromFirebaseByLocations([location]);
        if (!bins || bins.length === 0) {
            return handleNotFoundError(res, 'No bins found for the specified location');
        }

        res.status(200).json({
            bins,
            message: `Bins fetched successfully for location: ${location}`
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const fetchBinsFromFirebaseByLocations = async (locations) => {
    const bins = [];

    for (const location of locations) {
        const actualLocation = await findActualLocation(location);
        console.log(`Fetching bins for location: ${location}, Actual Location: ${actualLocation}`);
        if (!actualLocation) continue;

        const snapshot = await sensorDataRef.child(actualLocation).once('value');
        const locationBins = snapshot.val();

        if (locationBins) {
            Object.keys(locationBins).forEach(binId => {
                bins.push({ id: binId, ...locationBins[binId], location: actualLocation });
            });
        }
    }

    return bins;
};

const editBinByLocationAndId = async (req, res) => {
    try {
        const { location, id } = req.query;
        const updates = req.body;

        if (!location || !id) {
            return handleClientError(res, 'Both location and id are required');
        }

        customLogger.info(`Attempting to edit bin with ID: ${id} at location: ${location}`);

        const actualLocation = await findActualLocation(location);
        if (!actualLocation) {
            return handleNotFoundError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
        const snapshot = await binRef.once('value');
        const existingBin = snapshot.val();

        if (!existingBin) {
            return handleNotFoundError(res, 'Bin not found');
        }

        if (updates.binLocation) {
            updates.binLocation = actualLocation;
        }

        updates.lastUpdated = getFormattedDate();

        await binRef.update(updates);
        customLogger.info(`Bin ${id} at ${actualLocation} updated successfully`);

        res.status(200).json({
            status: 'success',
            message: 'Bin updated successfully',
            data: { ...existingBin, ...updates }
        });
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

        customLogger.info(`Attempting to delete bin with ID: ${id} at location: ${location}`);

        const actualLocation = await findActualLocation(location);
        if (!actualLocation) {
            return handleNotFoundError(res, 'Location not found');
        }

        const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
        const snapshot = await binRef.once('value');
        const existingBin = snapshot.val();

        if (!existingBin) {
            return handleNotFoundError(res, 'Bin not found');
        }

        await binRef.remove();
        customLogger.info(`Bin ${id} at ${actualLocation} deleted successfully`);

        res.status(200).json({
            status: 'success',
            message: 'Bin deleted successfully'
        });
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
    deleteBinByLocationAndId,
    getBinsBySupervisorAssignedLocations
};