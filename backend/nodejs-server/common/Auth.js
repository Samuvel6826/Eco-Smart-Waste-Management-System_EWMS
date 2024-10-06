const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRound = 10;

// Hash the password using bcrypt
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Hashing failed");
    }
};

// Compare the provided password with the stored hashed password
const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw new Error("Password comparison failed");
    }
};

// Create a JWT token with the provided payload
const createToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE,
            }
        );
        return token;
    } catch (error) {
        console.error("Error creating token:", error);
        throw new Error("Token creation failed");
    }
};

// Decode and verify a JWT token
const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error("Error decoding token:", error);
        throw new Error("Invalid or expired token");
    }
};

// Middleware to validate a JWT token and allow the request to proceed if valid
const validate = (req, res, next) => {
    try {
        const token = req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token not found" });
        }

        const payload = decodeToken(token);
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        if (currentTime >= payload.exp) {
            return res.status(401).json({ message: "Token has expired" });
        }

        req.user = payload; // Attach user data to request object for further use
        next();
    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to ensure the user has a specific role to access the route
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = req?.headers?.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Authorization token not found" });
            }

            const payload = decodeToken(token);
            // Check if the user's role is in the allowed roles
            if (allowedRoles.includes(payload.role)) {
                req.user = payload; // Attach user data to request object for further use
                return next();
            }

            return res.status(403).json({ message: `Access restricted to ${allowedRoles.join(', ')} roles only` });
        } catch (error) {
            console.error("Role guard error:", error);
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