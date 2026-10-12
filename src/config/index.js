// src/config/index.js
require('dotenv').config();

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wellnexus',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  stripeSecret: process.env.STRIPE_SECRET || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@local',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123'
};

module.exports = config;
