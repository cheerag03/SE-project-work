// api/index.js
// Vercel serverless wrapper for the Express app in src/app.js
// Exports a handler for Vercel (node) runtime, and can run as a dev server
const { app } = require('../src/app');
const connectDB = require('../src/config/db');

let dbConnected = false;
async function ensureDBConnected() {
  if (dbConnected) return;
  await connectDB();
  dbConnected = true;
}

module.exports = async (req, res) => {
  try {
    console.log('[api] handler start:', req.method, req.url, 'NODE_ENV=', process.env.NODE_ENV || 'not-set');
    // Make sure the DB is connected before handling requests
    await ensureDBConnected();
    console.log('[api] dbConnected=', dbConnected);
    // Express app is a function handler that can accept (req, res)
    return app(req, res);
  } catch (err) {
    console.error('Handler error', err);
    res.statusCode = 500;
    return res.end('Internal Server Error');
  }
};

// If run directly (node api/index.js) start a dev server for local testing
if (require.main === module) {
  (async () => {
    await ensureDBConnected();
    const http = require('http');
    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Dev server listening on port ${PORT}`);
    });
  })();
}
