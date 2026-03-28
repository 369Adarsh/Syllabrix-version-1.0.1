// Environment variable loader and validator
const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific .env file
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production'
  : NODE_ENV === 'qa' ? '.env.qa'
  : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '..', '..', envFile) });

// Fallback: also try .env in server root
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0 && NODE_ENV === 'production') {
  console.error('FATAL: Missing required env vars:', missing.join(', '));
  process.exit(1);
}

module.exports = {
  NODE_ENV,
  SERVER_PORT: parseInt(process.env.SERVER_PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    NAME: process.env.DB_NAME || 'syllabrix_dev',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    SSL: process.env.DB_SSL === 'true',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    EXPIRY: process.env.JWT_EXPIRY || '7d',
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    FOLDER: process.env.CLOUDINARY_FOLDER || 'dev',
  },
  EMAIL: {
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    FROM: process.env.EMAIL_FROM || 'support@syllabrix.com',
  },
};
