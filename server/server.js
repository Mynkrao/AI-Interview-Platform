// server.js
// Entry point. Connects to MongoDB, then starts the HTTP server.
// SAD Section 12.1: "Entry point. Starts HTTP server on PORT."

const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Fail loudly on unhandled promise rejections instead of leaving the
  // process in an undefined state (common source of silent MERN bugs).
  process.on('unhandledRejection', (err) => {
    console.error(`[server] Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

start();
