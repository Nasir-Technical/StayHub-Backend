const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      // These options are no longer needed in Mongoose 6+, but keeping for compatibility if using older versions, 
      // though we installed latest. We can omit them safely for Mongoose 6+.
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // throw error; // Let the caller handle it or at least don't kill the process immediately
  }
};

module.exports = connectDB;
