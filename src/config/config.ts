import dotenv from 'dotenv';

export interface Config {
  appEnv: string;
  dbUser: string;
  dbPass: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  twilioSid: string;
  twilioAuth: string;
  twilioPhone: string;
}

export function loadConfig(): Config {
  const appEnv = process.env.APP_ENV || 'dev';
  const envFile = `.env.${appEnv}`;

  dotenv.config({ path: envFile });

  return {
    appEnv,
    dbUser: process.env.DB_USER || 'root',
    dbPass: process.env.DB_PASS || '',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '3306', 10),
    dbName: process.env.DB_NAME || 'table_db',
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuth: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhone: process.env.TWILIO_PHONE_NUMBER || '',
  };
}