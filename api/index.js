const app = require('../src/app');
const connectDB = require('../src/config/db');

// Initialize DB connection (Outside handler for performance)
connectDB();

module.exports = (req, res) => {
  // Add direct health check for Vercel troubleshooting
  if (req.url === '/api/health') {
    return res.status(200).json({ status: 'ok', message: 'API is alive on Vercel' });
  }
  return app(req, res);
};
