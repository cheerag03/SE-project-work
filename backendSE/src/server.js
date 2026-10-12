// src/server.js
// Simple launcher file — useful for PM2 or docker ENTRYPOINT.
// It imports app.start() from src/app.js (which handles DB connect + socket.io boot)
const { start } = require('./app');

// If app.js exports start, use it. Otherwise require('./app') starts itself.
if (typeof start === 'function') {
  start().catch(err => {
    console.error('Failed to start server from server.js', err);
    process.exit(1);
  });
} else {
  // fallback: if app.js already started itself when required, do nothing
  console.log('start function not exported, assuming src/app.js handles startup.');
}
