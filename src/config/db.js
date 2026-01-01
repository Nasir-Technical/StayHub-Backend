const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  if (!config.mongoUri) {
    console.error('MONGO_URI is not defined in environment variables');
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri.trim());

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // throw error; // Let the caller handle it or at least don't kill the process immediately
  }
};

module.exports = connectDB;
