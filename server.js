import app from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import initSocket from './src/config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Dealkro Server running on port ${PORT}`);
});

initSocket(server);

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down server...');
  server.close(() => process.exit(1));
});

