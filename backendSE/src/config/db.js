// src/config/db.js
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? null : 'mongodb://localhost:27017/wellnexus');
  if (!uri) {
    // In production we should fail fast if no DB URI is provided, to aid debugging.
    throw new Error('MONGODB_URI not set in environment (.env)');
  }

  // If mongoose is already connected, skip re-connecting (reduces multiple connections in serverless)
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    // 1 == connected
    console.log('MongoDB already connected');
    return;
  }

  try {
    // Use recommended options for mongoose 6+
    await mongoose.connect(uri, {
      autoIndex: true
    });
    console.log('MongoDB connected ->', uri.includes('localhost') ? 'local' : 'atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};
