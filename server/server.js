const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB Database
connectDB();

const app = express();

// Configure CORS to allow access from frontend
app.use(cors({
  origin: '*', // We will restrict this to client URL in production
  credentials: true
}));

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());
// Built-in middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Recipe Recommendation API is running smoothly',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    // Only send full stack trace in development mode
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Determine Port
const PORT = process.env.PORT || 5000;

// Start Server listening
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
