const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose versions configure these defaults automatically,
      // but explicitly declaring configurations provides stability across versions.
      autoIndex: true,
    });

    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code (1) to shut down the server in case of connection failure
    process.exit(1);
  }
};

// Listen to connection errors after initial connection is established
mongoose.connection.on('error', err => {
  console.error(`Post-connection MongoDB error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection disconnected. Attempting to reconnect...');
});

module.exports = connectDB;
