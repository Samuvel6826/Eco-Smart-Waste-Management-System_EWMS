const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger'); // Assuming you have a logger utility

const saltRounds = 10;

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        logger.error("Error hashing password:", error.message || error);
        throw new Error("Hashing failed");
    }
};

const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        logger.error("Error comparing passwords:", error);
        throw new Error("Password comparison failed");
    }
};

const createToken = (payload) => {
    try {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    } catch (error) {
        logger.error("Error creating token:", error);
        throw new Error("Token creation failed");
    }
};

const decodeToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        logger.error("Error decoding token:", error);
        throw new Error("Invalid or expired token");
    }
};

const validate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token || token === 'null') {
            logger.warn("Authorization token not found or null");
            return res.status(401).json({ message: "Authorization token not found or invalid" });
        }

        const payload = decodeToken(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime >= payload.exp) {
            logger.warn("Token has expired");
            return res.status(401).json({ message: "Token has expired" });
        }

        req.user = payload;
        next();
    } catch (error) {
        logger.error("Token validation error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const roleGuard = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(" ")[1];

            if (!token || token === 'null') {
                logger.warn("Authorization token not found or null in roleGuard");
                return res.status(401).json({ message: "Authorization token not found or invalid" });
            }

            const payload = decodeToken(token);
            if (allowedRoles.includes(payload.role)) {
                req.user = payload;
                return next();
            }

            logger.warn(`Access denied for role ${payload.role}. Allowed roles: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ message: `Access restricted to ${allowedRoles.join(', ')} roles only` });
        } catch (error) {
            logger.error("Role guard error:", error);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    createToken,
    decodeToken,
    validate,
    roleGuard
};