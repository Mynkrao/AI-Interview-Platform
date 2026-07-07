// config/db.js
// Connects Mongoose to MongoDB Atlas.
// SAD Section 2.1: "Tier 3 — Data Layer: MongoDB Atlas ... Accessed exclusively
// through the Mongoose ODM. No direct database access from the frontend."
// SAD Section 12.1: "Connects Mongoose to MongoDB Atlas. Logs on success/failure."

const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[db] MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[db] MongoDB connection failed: ${error.message}`);
    // No DB connection means the API cannot function. Exit rather than
    // run a server that will fail on every single request.
    process.exit(1);
  }

  // Surface connection-level issues after the initial connect too
  // (e.g. Atlas cluster paused, network blip) instead of failing silently.
  mongoose.connection.on('error', (err) => {
    console.error(`[db] MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
}

module.exports = connectDB;
