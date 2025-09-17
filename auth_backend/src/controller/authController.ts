import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as Auth0Strategy } from 'passport-auth0';

import catchAsync from '../utils/catchAsync';
import { User, UserDocument } from '../models/userModel';
import AppError from '../utils/appError';
import { createSendToken } from '../utils/jwtHelpers';
import Email from '../utils/email';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

// Interface for token payload from JWT
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

const jwtSecret = process.env.JWT_SECRET as string;
if (!jwtSecret) throw new Error('ERROR:❌ jwtSecret not found');

// Helper: find or create user based on provider
const findOrCreateUser = async (
  provider: 'google' | 'github',
  profile: any,
) => {
  const providerIdField = provider === 'google' ? 'googleId' : 'githubId';
  const query = { [providerIdField]: profile.id };

  let user = await User.findOne(query);
  if (!user) {
    user = await User.create({
      [providerIdField]: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
    });
  }
  return user;
};

// ---
// EMAIL & PASSWORD AUTHENTICATION HANDLERS
// ---

// Signup handler
const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // 1. Check if the passwords match. This is the crucial step we discussed.
    if (req.body.password !== req.body.passwordConfirm) {
      return next(new AppError('Passwords do not match.', 400));
    }

    // 2. Create new user. Mongoose will automatically hash the password
    // due to the pre-save middleware in the user model.
    const newUser = (await User.create({
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })) as UserDocument;

    // 3. Create and send the tokens to the client. This function also handles
    // removing the password from the final response object.
    createSendToken(newUser, 201, res);
  },
);

// Login handler
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;

    // i. Check if email & password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // ii. Check if user exists and if the password is correct
    // explicitly select the password field for this query
    const user = await User.findOne({ email }).select('+password');

    // If a user with that email is found, check if they signed up with Google
    if (user?.googleId) {
      return next(
        new AppError(
          'This email is associated with a Google account. Please use the "Sign in with Google" button.',
          401,
        ),
      );
    } else if (user?.githubId) {
      return next(
        new AppError(
          'This email is associated with a Github account. Please use the "Sign in with Github" button.',
          401,
        ),
      );
    }

    // If no user is found OR the password is not correct, return an error
    const typedUser = user as UserDocument;
    if (!typedUser || !(await typedUser.correctPassword(password))) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    // iii. If everything is okay, send a token to the client
    createSendToken(typedUser, 200, res);
  },
);

// ---
// GOOGLE & GITHUB AUTHENTICATION HANDLERS (SIGNUP/IN)
// ---
// Initialize Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://127.0.0.1:3000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser('google', profile);
        done(null, user as UserDocument);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

// Initialize GITHUB STRATEGY
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: 'http://127.0.0.1:3000/api/v1/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, extraParams, profile, done) => {
      try {
        const user = await findOrCreateUser('github', profile);
        done(null, user as UserDocument);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

// Initialize GITHUB (VIA AUTH0) STRATEGY
/*
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN!,
      clientID: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      callbackURL: 'http://127.0.0.1:3000/api/v1/auth/callback',
    },
    async (accessToken, refreshToken, extraParams, profile, done) => {
      try {
        const user = await findOrCreateUser('github', profile);
        done(null, user as UserDocument);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);
*/

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as UserDocument);
  } catch (err) {
    done(err, false);
  }
});

// Start the Google authentication flow
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Handle the Google authentication callback
const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: '/api/v1/auth/login',
});

// Handle successful authentication and create a JWT
const googleAuthSuccess = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    if (!user) {
      return next(new AppError('Google authentication failed.', 401));
    }

    createSendToken(user, 200, res);
  },
);

// Start the Github authentication flow
const githubAuth = passport.authenticate('github', { scope: ['user:email'] });

// Handle the Github authentication callback
const githubAuthCallback = passport.authenticate('github', {
  failureRedirect: '/api/v1/auth/login',
});

// Handle successful authentication and create a JWT
const githubAuthSuccess = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    if (!user) {
      return next(new AppError('Github authentication failed.', 401));
    }

    createSendToken(user, 200, res);
  },
);

/*
// Start the Github (with Auth0) authentication flow
const githubAuth = passport.authenticate('auth0', {
  scope: 'openid profile email',
});
// Handle the Github authentication callback
const githubAuthCallback = passport.authenticate('auth0', {
  failureRedirect: '/api/v1/auth/login',
});
// Handle successful authentication and create a JWT
const githubAuthSuccess = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    if (!user) {
      return next(new AppError('Github authentication failed.', 401));
    }

    createSendToken(user, 200, res);
  },
);
*/

// ---
// LOGOUT HANDLER
// ---
const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({
      status: 'success',
      message: 'You have been logged out successfully.',
    });
  });
};

// ---
// PASSWORD RESET HANDLERS
// ---
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = (await User.findOne({
      email: req.body.email,
    })) as UserDocument;
    if (!user)
      return next(
        new AppError('There is no user with this email address.', 404),
      );

    // Check if the user is a Google-authenticated user
    if (user.googleId) {
      return next(
        new AppError(
          'This email is associated with a Google account. Please sign in with Google.',
          401,
        ),
      );
    } else if (user.githubId) {
      return next(
        new AppError(
          'This email is associated with a Github account. Please sign in with Github.',
          401,
        ),
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const email = new Email(user, resetURL);
      await email.sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Please try again later.',
          500,
        ),
      );
    }
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = (await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })) as UserDocument;

    if (!user)
      return next(new AppError('Token is invalid or has expired.', 400));

    if (req.body.password !== req.body.passwordConfirm) {
      return next(new AppError('Passwords do not match.', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  },
);

// Protect route
const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // i. get token and check if it's in the req.headers
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;

    // type-guard to check if the token is valid
    if (!token)
      return next(
        new AppError('You are not logged in. Please login to get access.', 401),
      );

    // ii. Verify & decode the JWT token async using the secret
    const decoded = await new Promise<DecodedToken>((res, rej) => {
      jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
        if (err) return rej(err);
        res(decoded as DecodedToken);
      });
    });

    // iii. check if user still exists
    const currentUser: UserDocument | null = await User.findById(decoded.id);
    if (!currentUser)
      return next(new AppError("The token's user no longer exist.", 401));

    // iv. check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat))
      return next(
        new AppError(
          'You recently changed your password! Please login again.',
          401,
        ),
      );

    // v. grant access if everything is ok
    req.user = currentUser;
    next();
  },
);

export default {
  signup,
  login,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthCallback,
  googleAuthSuccess,
  githubAuth,
  githubAuthCallback,
  githubAuthSuccess,
  protect,
  logout,
};
