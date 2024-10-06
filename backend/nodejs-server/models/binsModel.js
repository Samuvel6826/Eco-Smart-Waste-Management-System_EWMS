// models/binModel.js
const Joi = require('joi');

const binMetaDataSchema = Joi.object({
    id: Joi.number().required(),
    binLocation: Joi.string().required(),
    binType: Joi.string().required(),
    geoLocation: Joi.object({
        latitude: Joi.string().allow('').default("latitude"),
        longitude: Joi.string().allow('').default("longitude"),
    }),
    microProcessorStatus: Joi.string().valid('ON', 'OFF').default('OFF'),
    sensorStatus: Joi.string().valid('ON', 'OFF').default('OFF'),
    binLidStatus: Joi.string().valid('OPEN', 'CLOSED').default('CLOSED'),
    binActiveStatus: Joi.string().valid('Active', 'inActive').default('inActive'),
    distance: Joi.number().default(0),
    filledBinPercentage: Joi.number().min(0).max(100).default(0),
    maxBinCapacity: Joi.number().min(0).default(0)
});

const distanceSchema = Joi.object({
    id: Joi.number().required(),
    binLocation: Joi.string().required(),
    geoLocation: Joi.object({
        latitude: Joi.string().allow('').default("latitude"),
        longitude: Joi.string().allow('').default("longitude"),
    }),
    microProcessorStatus: Joi.string().valid('ON', 'OFF').required(),
    sensorStatus: Joi.string().valid('ON', 'OFF').required(),
    binLidStatus: Joi.string().valid('OPEN', 'CLOSED').required(),
    binActiveStatus: Joi.string().valid('Active', 'inActive').default('Active'),
    distance: Joi.number().required(),
    filledBinPercentage: Joi.number().min(0).max(100).required(),
    maxBinCapacity: Joi.number().min(0).required()
});

const heartbeatSchema = Joi.object({
    id: Joi.number().required(),
    binLocation: Joi.string().required(),
    microProcessorStatus: Joi.string().valid('ON', 'OFF').required()
});

module.exports = {
    binMetaDataSchema,
    distanceSchema,
    heartbeatSchema
};