import { db } from './db/database';
import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { Server } from 'http';
import { log } from './libs/logger';

let server: Server;
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const connectToDb = async () => {
  await db.$connect();
};

// Graceful shutdown
const shutdown = () => {
  log.warn('Shutting down server...');
  server.close(() => {
    log.warn('Server closed.');
    process.exit(0);
  });
};

connectToDb()
  .then(() => {
    log.info('Database connection established.');
  })
  .catch((error) => {
    log.error('Error establishing database connection:', error);
    db.$disconnect();
    process.exit(1);
  });

server = app.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
