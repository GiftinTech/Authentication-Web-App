import mongoose, { Error } from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
dotenv.config();

const db_uri = process.env.DATABASE;
const port = process.env.PORT || 3000;

if (!db_uri || !port) {
  throw new Error('Error❌: db_uri, or port not found');
}

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('uncaughtExceptionMonitor', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION MONITOR! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// connect to mongoDB
(async () => {
  try {
    await mongoose.connect(db_uri);
    console.log('---------------------------------');
    console.log('DB connection successful! ✅');
    console.log('---------------------------------');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();

// Listen for the server
const server = app.listen(port, () => {
  console.log('-----------------------------------');
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
