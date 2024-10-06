// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const rateLimits = {
    createBin: { requests: 25, timeFrame: 15 },
    sensorDistance: { requests: 1000, timeFrame: 10 },
    heartbeat: { requests: 2000, timeFrame: 10 },
};

exports.createBinLimiter = rateLimit({
    windowMs: rateLimits.createBin.timeFrame * 60 * 1000,
    max: rateLimits.createBin.requests,
    message: `Too many requests from this IP, please try again after ${rateLimits.createBin.timeFrame} minute(s).`
});

exports.sensorDistanceLimiter = rateLimit({
    windowMs: rateLimits.sensorDistance.timeFrame * 60 * 1000,
    max: rateLimits.sensorDistance.requests,
    message: `Too many requests from this IP, please try again after ${rateLimits.sensorDistance.timeFrame} minute(s).`
});

exports.heartbeatLimiter = rateLimit({
    windowMs: rateLimits.heartbeat.timeFrame * 60 * 1000,
    max: rateLimits.heartbeat.requests,
    message: `Too many heartbeat requests from this IP, please try again after ${rateLimits.heartbeat.timeFrame} minute(s).`
});

