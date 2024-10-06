// routes/binRoutes.js
const express = require('express');
const { createBin, updateSensorDistance, updateHeartbeat } = require('../controllers/binController');
const { createBinLimiter, sensorDistanceLimiter, heartbeatLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/create', createBinLimiter, createBin);
router.post('/sensor-distance', sensorDistanceLimiter, updateSensorDistance);
router.post('/sensor-heartbeat', heartbeatLimiter, updateHeartbeat);

module.exports = router;