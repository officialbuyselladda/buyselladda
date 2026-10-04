import app from './src/app.js';
import connectDB from './src/config/db.js';
import env from './src/config/env.js';
import initSocket from './src/config/socket.js';
import redis from './src/config/redis.js';
import fs from 'fs';
import path from 'path';
import { startProductAutoApprovalJob } from './src/jobs/productAutoApproval.job.js';

const PORT = env.PORT;
const HTTPS_PORT = env.HTTPS_PORT;

// Check if SSL certificates exist for HTTPS
let sslOptions = null;

const keyPath = path.join(process.cwd(), 'ssl', 'private key.pem');
const certPath = path.join(process.cwd(), 'ssl', 'certificate.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    console.log('✅ SSL certificates loaded successfully');
  } catch (err) {
    console.log('⚠️  Error loading SSL certificates:', err.message);
  }
}

await connectDB();
redis.client;
startProductAutoApprovalJob();

// Start server based on SSL availability
if (sslOptions) {
  // HTTPS Server
  import('https').then(https => {
    const server = https.createServer(sslOptions, app);
    server.listen(HTTPS_PORT, () => {
      console.log(`🔒 Dealkro HTTPS Server running on port ${HTTPS_PORT}`);
    });
    initSocket(server);
  });
  
  // Also HTTP server for redirect
  import('http').then(http => {
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT} (redirect to HTTPS)`);
    });
  });
} else {
  // HTTP only - for development
  import('http').then(http => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Dealkro Server running on port ${PORT}`);
    });
    initSocket(server);
  });
}

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection!', err.name || err.message);
  console.error('Full error:', err.stack);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception!', err.stack);
});

