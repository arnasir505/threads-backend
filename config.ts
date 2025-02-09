import { configDotenv } from 'dotenv';

configDotenv({ path: '.env' });

const config = {
  port: (process.env['PORT'] && parseInt(process.env['PORT'])) || '8000',
  mongoose: {
    db: process.env['MONGO_DB_URL'] || 'mongodb://127.0.0.1:27017/threads',
  },
  IpWhiteList: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env['ALLOWED_ORIGIN']!,
  ],
  JwtAccessExpiresAt: 60 * 15,
  JwtRefreshExpiresAt: 1000 * 60 * 60 * 370,
};

export default config;
