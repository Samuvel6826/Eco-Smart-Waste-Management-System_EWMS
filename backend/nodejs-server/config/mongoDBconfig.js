const mongoose = require('mongoose');

const connectToDatabase = async (retries = 5, interval = 5000) => {
    const dbUrl = `${process.env.dbUrl}/${process.env.dbName}`;
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
            console.log('\n---*** EWMS MongoDB Database Connected Successfully ***---');

            // Set up connection error handler
            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });

            // Set up disconnection handler
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected. Attempting to reconnect...');
                setTimeout(() => connectToDatabase(retries - 1, interval), interval);
            });

            return true; // Connection successful
        } catch (error) {
            console.error(`\nAttempt ${attempt} - Error connecting to EWMS MongoDB Database:`, error.message);

            if (attempt === retries) {
                console.error('Max retries reached. Unable to connect to the database.');
                return false; // Connection failed after all retries
            }

            console.log(`Retrying in ${interval / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
};

module.exports = connectToDatabase;