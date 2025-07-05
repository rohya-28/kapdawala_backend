import { config as conf } from 'dotenv';

conf(); 

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`❌ Missing environment variable: ${key}`);
  return value;
}

const _config = {
  port: process.env.PORT || '3000',
  databaseUrl: requiredEnv('MONGO_CONNECTION_STRING'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requiredEnv('JWT_SECRET'),
  frontEndDomain: process.env.FRONT_END_DOMAIN || '*',
};

export const config = Object.freeze(_config);
 