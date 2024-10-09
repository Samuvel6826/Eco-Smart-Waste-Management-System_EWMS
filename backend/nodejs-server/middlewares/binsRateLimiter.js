// Import express-rate-limit
const rateLimit = require('express-rate-limit');

// Rate limit configurations
const rateLimits = {
    createBin: { requests: 25, timeFrame: 15 },
    sensorDistance: { requests: 1000, timeFrame: 10 },
    heartbeat: { requests: 2000, timeFrame: 10 },
    getBins: { requests: 100, timeFrame: 15 },
    getBinById: { requests: 200, timeFrame: 15 },
    editBin: { requests: 50, timeFrame: 15 },
    deleteBin: { requests: 20, timeFrame: 60 }
};

// Create rate limiters
const createBinLimiter = rateLimit({
    windowMs: rateLimits.createBin.timeFrame * 60 * 1000,
    max: rateLimits.createBin.requests,
    message: `Too many bin creation requests. Please try again later. You can try again in ${rateLimits.createBin.timeFrame} minutes.`
});

const sensorDistanceLimiter = rateLimit({
    windowMs: rateLimits.sensorDistance.timeFrame * 60 * 1000,
    max: rateLimits.sensorDistance.requests,
    message: `Too many sensor distance update requests. Please try again later. You can try again in ${rateLimits.sensorDistance.timeFrame} minutes.`
});

const heartbeatLimiter = rateLimit({
    windowMs: rateLimits.heartbeat.timeFrame * 60 * 1000,
    max: rateLimits.heartbeat.requests,
    message: `Too many heartbeat requests. Please try again later. You can try again in ${rateLimits.heartbeat.timeFrame} minutes.`
});

const getBinsLimiter = rateLimit({
    windowMs: rateLimits.getBins.timeFrame * 60 * 1000,
    max: rateLimits.getBins.requests,
    message: `Too many requests to fetch bins. Please try again later. You can try again in ${rateLimits.getBins.timeFrame} minutes.`
});

const getBinByIdLimiter = rateLimit({
    windowMs: rateLimits.getBinById.timeFrame * 60 * 1000,
    max: rateLimits.getBinById.requests,
    message: `Too many requests to fetch specific bin. Please try again later. You can try again in ${rateLimits.getBinById.timeFrame} minutes.`
});

const editBinLimiter = rateLimit({
    windowMs: rateLimits.editBin.timeFrame * 60 * 1000,
    max: rateLimits.editBin.requests,
    message: `Too many bin edit requests. Please try again later. You can try again in ${rateLimits.editBin.timeFrame} minutes.`
});

const deleteBinLimiter = rateLimit({
    windowMs: rateLimits.deleteBin.timeFrame * 60 * 1000,
    max: rateLimits.deleteBin.requests,
    message: `Too many bin deletion requests. Please try again later. You can try again in ${rateLimits.deleteBin.timeFrame} minutes.`
});

module.exports = {
    createBinLimiter,
    sensorDistanceLimiter,
    heartbeatLimiter,
    getBinsLimiter,
    getBinByIdLimiter,
    editBinLimiter,
    deleteBinLimiter
};