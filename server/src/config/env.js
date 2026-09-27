import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect',
  JWT_SECRET: process.env.JWT_SECRET || 'mediconnect_fallback_dev_secret_never_use_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_API_KEY: process.env.AI_API_KEY || '',
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
    USER: process.env.EMAIL_USER || '',
    PASSWORD: process.env.EMAIL_PASSWORD || '',
  },
  MAP_API_KEY: process.env.MAP_API_KEY || '',
};
