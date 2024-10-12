const admin = require('firebase-admin');
const { binMetaDataSchema, distanceSchema, heartbeatSchema } = require('../models/binsModel');
const { getFormattedDate, updateDeviceStatus } = require('../utils/deviceMonitoring');
const { logger: customLogger } = require('../utils/logger'); // Import the logger

// Firebase references
const firebaseDB = admin.database();
const sensorDataRef = firebaseDB.ref('Trash-Bins');

// AppError class
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
const createBin = catchAsync(async (req, res, next) => {
    const { error, value } = binMetaDataSchema.validate(req.body);
    if (error) {
        return next(new AppError('Invalid data format or missing required fields', 400));
    }

    const { id, binLocation } = value;
    customLogger.info(`Attempting to create new bin with ID: ${id} at location: ${binLocation}`);

    try {
        const binRef = sensorDataRef.child(`${binLocation}/${id}`);
        const existingBin = await binRef.once('value');

        if (existingBin.exists()) {
            return next(new AppError(`Bin with ID ${id} already exists at location ${binLocation}`, 409));
        }

        const dataToSave = {
            ...value,
            lastUpdated: getFormattedDate(),
            createdAt: getFormattedDate(),
        };

        await binRef.set(dataToSave);
        customLogger.info('New bin metadata saved to Firebase:', dataToSave);

        res.status(201).json({
            status: 'success',
            message: 'Bin created successfully',
            data: dataToSave
        });
    } catch (error) {
        customLogger.error('Error creating bin:', error);
        return next(new AppError('An error occurred while creating the bin', 500));
    }
});

const updateSensorDistance = catchAsync(async (req, res, next) => {
    customLogger.info('Incoming request body:', req.body);

    const { error, value } = distanceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return next(new AppError(`Invalid distance data: ${errorMessages.join(', ')}`, 400));
    }

    const { id, binLocation, sensorStatus } = value;
    customLogger.info(`Updating sensor distance for bin location: ${binLocation} and ID: ${id}`);

    const actualLocation = await findActualLocation(binLocation);
    if (!actualLocation) return next(new AppError('Location not found', 404));

    const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
    const existingDataSnapshot = await binRef.once('value');
    const existingData = existingDataSnapshot.val();

    if (!existingData) return next(new AppError('No existing data found for this bin', 404));

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

        // Update device status without changing the sensor status
        updateDeviceStatus(binLocation, id, 'sensor-distance', sensorStatus);

        // Combine existing data with updates for the response
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
});

const updateHeartbeat = catchAsync(async (req, res) => {
    customLogger.info('Incoming heartbeat request body:', req.body);

    const { error, value } = heartbeatSchema.validate(req.body);
    if (error) {
        customLogger.error('Validation error:', error.details);
        throw new AppError('Invalid heartbeat data', 400);
    }

    const { id, binLocation } = value;
    customLogger.info(`Updating heartbeat for bin location: ${binLocation} and ID: ${id}`);

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

    customLogger.info('Heartbeat data to be saved:', dataToSave);

    await binRef.update(dataToSave);
    customLogger.info('Heartbeat updated successfully');

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

const editBinByLocationAndId = catchAsync(async (req, res, next) => {
    const { location, id } = req.query;
    const updates = req.body;

    if (!location || !id) {
        return next(new AppError('Both location and id are required', 400));
    }

    customLogger.info(`Attempting to edit bin with ID: ${id} at location: ${location}`);

    const actualLocation = await findActualLocation(location);
    if (!actualLocation) {
        return next(new AppError('Location not found', 404));
    }

    const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
    const snapshot = await binRef.once('value');
    const existingBin = snapshot.val();

    if (!existingBin) {
        return next(new AppError('Bin not found', 404));
    }

    // Ensure the location in the updates matches the actual location
    if (updates.binLocation) {
        updates.binLocation = actualLocation;
    }

    updates.lastUpdated = getFormattedDate();

    try {
        await binRef.update(updates);
        customLogger.info(`Bin ${id} at ${actualLocation} updated successfully`);

        res.status(200).json({
            status: 'success',
            message: 'Bin updated successfully',
            data: { ...existingBin, ...updates }
        });
    } catch (error) {
        customLogger.error('Error updating bin:', error);
        return next(new AppError('An error occurred while updating the bin', 500));
    }
});

const deleteBinByLocationAndId = catchAsync(async (req, res, next) => {
    const { location, id } = req.query;

    if (!location || !id) {
        return next(new AppError('Both location and id are required', 400));
    }

    customLogger.info(`Attempting to delete bin with ID: ${id} at location: ${location}`);

    const actualLocation = await findActualLocation(location);
    if (!actualLocation) {
        return next(new AppError('Location not found', 404));
    }

    const binRef = sensorDataRef.child(`${actualLocation}/${id}`);
    const snapshot = await binRef.once('value');
    const existingBin = snapshot.val();

    if (!existingBin) {
        return next(new AppError('Bin not found', 404));
    }

    try {
        await binRef.remove();
        customLogger.info(`Bin ${id} at ${actualLocation} deleted successfully`);

        res.status(200).json({
            status: 'success',
            message: 'Bin deleted successfully'
        });
    } catch (error) {
        customLogger.error('Error deleting bin:', error);
        return next(new AppError('An error occurred while deleting the bin', 500));
    }
});

module.exports = {
    createBin,
    updateSensorDistance,
    updateHeartbeat,
    getBins,
    getBinByLocationAndId,
    editBinByLocationAndId,
    deleteBinByLocationAndId
};