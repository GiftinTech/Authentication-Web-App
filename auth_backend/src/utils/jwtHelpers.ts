import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserDocument } from '../models/userModel';

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;
const refreshTokenExpiresIn: number = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN,
);
const jwtCookieExpiresIn: number = Number(process.env.JWT_COOKIE_EXPIRES_IN);

// Ensure JWT config variables are present, else throw server error
if (!jwtSecret || !jwtExpiresIn)
  throw new Error(
    'JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables',
  );

// Helper to sign JWT token with user ID
export const signToken = (id: string | number): string => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

// Helper to sign refresh token
export const signRefreshToken = (id: string | number): string => {
  return jwt.sign({ id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

// Sends tokens in cookie and response, hides sensitive data
export const createSendToken = (
  user: UserDocument,
  statusCode: number,
  res: Response,
) => {
  // 1. Sign both tokens using the user's unique _id
  // We explicitly convert the ObjectId to a string
  const accessToken = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  // 2. Set cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite:
      process.env.NODE_ENV === 'development'
        ? ('lax' as 'lax')
        : ('none' as 'none'),
  };

  // 3. Send the refresh token in a cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // 4. Create a clean user object to send in the response
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  delete userWithoutPassword.refreshToken;

  // 5. Send the access token in the JSON response
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: {
      user: userWithoutPassword,
    },
  });
};
