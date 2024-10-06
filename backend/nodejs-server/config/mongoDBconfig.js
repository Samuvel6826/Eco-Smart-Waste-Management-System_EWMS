const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectToDatabase = async (retries = 5, interval = 5000) => {
    const dbUrl = `${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`;
    const connectionOptions = {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        retryWrites: true,
        w: 'majority'
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(dbUrl, connectionOptions);
            logger.info('Connected to EWMS MongoDB Database Successfully');

            // Set up connection error handler
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error:', { error });
            });

            // Set up disconnection handler
            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected. Attempting to reconnect...');
                setTimeout(() => connectToDatabase(retries - 1, interval), interval);
            });

            return true; // Connection successful
        } catch (error) {
            logger.error(`Attempt ${attempt} - Error connecting to EWMS MongoDB Database: ${error.message}`);

            if (attempt === retries) {
                logger.error('Max retries reached. Unable to connect to the database.');
                return false; // Connection failed after all retries
            }

            logger.info(`Retrying in ${interval / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
};

module.exports = connectToDatabase;