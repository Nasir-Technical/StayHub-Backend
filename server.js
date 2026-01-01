const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

// Connect to Database
connectDB();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
