const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../routes/auth');
const homeRoutes = require('../routes/homes');
const favoriteRoutes = require('../routes/favorites');
const bookingRoutes = require('../routes/bookings');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// DB connection middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MONGODB_URI is not set in environment variables' });
    }
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
  }
  next();
});

// Vercel routes /api/(.*) to this file with the FULL path preserved
// So a request to /api/homes arrives here as /api/homes
// We mount routes at /api/* to match
app.use('/api/auth', authRoutes);
app.use('/api/homes', homeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db_state: mongoose.connection.readyState,
  env: { uri: !!process.env.MONGODB_URI, jwt: !!process.env.JWT_SECRET }
}));

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

module.exports = app;
