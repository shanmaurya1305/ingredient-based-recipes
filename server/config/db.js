const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database using Mongoose
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipe_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If cloud Atlas URI fails, try local MongoDB instance as fallback
    if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://127.0.0.1:27017/recipe_db') {
      try {
        console.log('Attempting connection to fallback local MongoDB (mongodb://127.0.0.1:27017/recipe_db)...');
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/recipe_db', {
          autoIndex: true,
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`Local Fallback MongoDB Connected successfully to host: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`Local Fallback MongoDB Connection Error: ${fallbackErr.message}`);
      }
    }
    console.warn('⚠️ Server will continue running without MongoDB connection. DB endpoints may return errors until MongoDB is reachable.');
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
