import path from 'path';
import express, { NextFunction, Request, Response } from 'express';

import session from 'express-session';
import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import hpp from 'hpp';

import AppError from './utils/appError';
import globalErrorHandler from './controller/errorController';
import authRouter from './routes/authRoutes';
import sanitizeRequest from './utils/sanitizeMiddleware';

// start express app
const app = express();

app.set('trust proxy', 1); // Allow Express to trust reverse proxy headers (e.g., for Heroku/Render)

app.get('/ip', (req: Request, res: Response) => {
  console.log(req.headers);
  res.send(req.ip);
}); // Logs headers and responds with the client's IP

// -g middlewares
// enable cors
let corsOptions;

process.env.NODE_ENV === 'development'
  ? (corsOptions = {
      origin: 'http://localhost:5173',
      credentials: true,
    })
  : (corsOptions = {
      origin: [''],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
app.use(cors(corsOptions)); // apply cors MW

app.use(helmet()); // apply security headers

// http req logger
process.env.NODE_ENV === 'development'
  ? app.use(morgan('dev'))
  : app.use(morgan('common'));

const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  windowMs: 30 * 60 * 1000, // 30mins
  message: 'Too many requests from this IP, please try again in 30 mins!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter); // Limit request from same IP

// Body parsers: read data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse form data
app.use(cookieParser()); // parse cookies

// --- Session and Passport Middleware ---
const SESSION_SECRET = process.env.SESSION_SECRET as string;
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
// --- End of Session and Passport Middleware ---

app.use((req: Request, res: Response, next: NextFunction) => {
  const originalQuery = req.query;
  Object.defineProperty(req, 'query', {
    value: { ...originalQuery },
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
}); // Make req.query writable BEFORE any MW that mutates it

app.use(mongoSanitize()); // data sanitization against NoSQL query injection
app.use(sanitizeRequest); // sanitize all incoming requests
app.use(hpp()); // prevent param pollution
app.use(compression()); // reduce size of res body to improve perf & load time
app.disable('x-powered-by'); // hide express version info

if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    res.redirect('https://' + req.headers.host + req.url);
  });
} // convert http to https in prod

app.use(express.static(path.join(__dirname, 'punlic'))); // serve static files in public/

// MW to handle 404 routes
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req: Request, res: Response) => res.send('API Running 🏃‍♀️'));

// TODO: mount all routers
app.use('/api/v1/auth', authRouter);

app.use(notFoundHandler); // use MW to handle 404 routes

// TODO: catch all global errors
app.use(globalErrorHandler);

export default app;
