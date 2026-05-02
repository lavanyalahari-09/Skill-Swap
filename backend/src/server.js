import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { setupSocket } from './socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
setupSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Skill Swap API running on port ${PORT}`);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing backend process or set a different PORT in backend/.env.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});
