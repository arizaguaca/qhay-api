import { Response } from 'express';

export const COOKIE_NAME = 'token';
export const CUSTOMER_COOKIE_NAME = 'customer_token';

// Duration matching the JWT token lifetime (e.g. 24 hours)
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: 'lax' as const,
  maxAge: MAX_AGE_MS,
});

const isSecure = () =>
  process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'prod';

/** Set the staff/admin JWT cookie */
export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, cookieOptions(isSecure()));
};

/** Set the customer JWT cookie (separate from staff) */
export const setCustomerTokenCookie = (res: Response, token: string): void => {
  res.cookie(CUSTOMER_COOKIE_NAME, token, cookieOptions(isSecure()));
};

export const clearTokenCookie = (res: Response): void => {
  const opts = { httpOnly: true, secure: isSecure(), sameSite: 'lax' as const };
  res.clearCookie(COOKIE_NAME, opts);
};

export const clearCustomerTokenCookie = (res: Response): void => {
  const opts = { httpOnly: true, secure: isSecure(), sameSite: 'lax' as const };
  res.clearCookie(CUSTOMER_COOKIE_NAME, opts);
};
