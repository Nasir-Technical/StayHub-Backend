const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

// Connect to Database
connectDB();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
