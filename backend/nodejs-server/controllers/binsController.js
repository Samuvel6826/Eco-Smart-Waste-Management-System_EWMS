const admin = require('firebase-admin');
const { binMetaDataSchema, distanceSchema, heartbeatSchema } = require('../models/binsModel');
const { getFormattedDate, updateDeviceStatus } = require('../utils/deviceMonitoring');
const { logger } = require('../utils/logger');

// Firebase references
const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

// Enhanced error handling class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Catch async errors
const catchAsync = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Error handling response
const handleError = (err, res) => {
    logger.error(err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};

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

// Enhanced bin operations
const createBin = catchAsync(async (req, res) => {
    const { error, value } = binMetaDataSchema.validate(req.body);
    if (error) throw new AppError('Invalid data format or missing required fields', 400);

    const { id, binLocation } = value;
    logger.info(`Attempting to create new bin with ID: ${id} at location: ${binLocation}`);

    const binRef = sensorDataRef.child(`${binLocation}/${id}`);
    const existingBin = await binRef.once('value');

    if (existingBin.exists()) {
        throw new AppError(`Bin with ID ${id} already exists at location ${binLocation}`, 400);
    }

    const dataToSave = {
        ...value,
        lastUpdated: getFormattedDate(),
        createdAt: getFormattedDate(),
        lastMaintenance: "",
    };

    await binRef.set(dataToSave);
    logger.info('New bin metadata saved to Firebase:', dataToSave);

    res.status(201).json({ message: 'Bin created successfully', data: dataToSave });
});

const updateSensorDistance = catchAsync(async (req, res) => {
    logger.info('Incoming request body:', req.body);

    const { error, value } = distanceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        throw new AppError(`Invalid distance data: ${errorMessages.join(', ')}`, 400);
    }

    const { id, binLocation } = value;
    logger.info(`Updating sensor distance for bin location: ${binLocation} and ID: ${id}`);

    const actualLocation = await findActualLocation(binLocation);
    if (!actualLocation) throw new AppError('Location not found', 404);

    const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
    const existingDataSnapshot = await binRef.once('value');
    const existingData = existingDataSnapshot.val();

    if (!existingData) throw new AppError('No existing data found for this bin', 404);

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

        logger.info('Fields to be updated:', fieldsToUpdate);

        await binRef.update(fieldsToUpdate);
        logger.info('Bin data updated successfully');

        updateDeviceStatus(binLocation, id, 'sensor-distance');
    } else {
        logger.info('No changes detected. Skipping update.');
    }

    // Combine existing data with updates for the response
    const updatedData = { ...existingData, ...fieldsToUpdate };

    res.status(200).json({
        message: hasChanges ? 'Bin data updated successfully' : 'No changes were necessary',
        data: updatedData
    });
});

const updateHeartbeat = catchAsync(async (req, res) => {
    logger.info('Incoming heartbeat request body:', req.body);

    const { error, value } = heartbeatSchema.validate(req.body);
    if (error) {
        console.error('Validation error:', error.details);
        throw new AppError('Invalid heartbeat data', 400);
    }

    const { id, binLocation } = value;
    logger.info(`Updating heartbeat for bin location: ${binLocation} and ID: ${id}`);

    const actualLocation = await findActualLocation(binLocation);
    if (!actualLocation) throw new AppError('Location not found', 404);

    const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
    const existingDataSnapshot = await binRef.once('value');
    const existingData = existingDataSnapshot.val();

    if (!existingData) throw new AppError('No existing data found for this bin', 404);

    const dataToSave = {
        ...existingData,
        ...value,
        lastUpdated: getFormattedDate(),
    };

    logger.info('Heartbeat data to be saved:', dataToSave);

    await binRef.update(dataToSave);
    logger.info('Heartbeat updated successfully');

    updateDeviceStatus(binLocation, id, 'heartbeat');
    res.status(200).json({ message: 'Heartbeat updated successfully', data: dataToSave });
});

const getBins = catchAsync(async (req, res) => {
    const snapshot = await sensorDataRef.once('value');
    const bins = snapshot.val();
    res.status(200).json(bins);
});

const getBinByLocationAndId = catchAsync(async (req, res) => {
    const { location, id } = req.query;
    if (!location || !id) throw new AppError('Both location and id are required', 400);

    const actualLocation = await findActualLocation(location);
    if (!actualLocation) throw new AppError('Location not found', 404);

    const binSnapshot = await sensorDataRef.child(`${actualLocation}/${id}`).once('value');
    const binData = binSnapshot.val();
    if (!binData) throw new AppError('No bin found with this ID and location', 404);

    res.status(200).json(binData);
});

module.exports = {
    createBin,
    updateSensorDistance,
    updateHeartbeat,
    getBins,
    getBinByLocationAndId,
    handleError
};