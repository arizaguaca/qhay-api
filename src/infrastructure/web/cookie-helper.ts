import { Response } from 'express';

export const COOKIE_NAME = 'token';

// Duration matching the JWT token lifetime (e.g. 24 hours)
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'prod',
    sameSite: 'lax', // Use 'lax' to support standard frontend integrations
    maxAge: MAX_AGE_MS,
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'prod',
    sameSite: 'lax',
  });
};
