import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { Server } from 'http';
import { log } from '@infra/logger';
import { startQueuesAndCrons } from '@infra/queues/queues';
import { getRedisInstance } from '@infra/db/cache';
import { db } from '@infra/db/database';

getRedisInstance().ping((err) => {
  if (err) {
    log.error({
      message: 'Error connecting to Redis',
      code: '',
      error: err,
    });
    process.exit(1);
  } else {
    log.info('Connected to Redis');
  }
});

let server: Server | null = null;
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
  if (!server) {
    log.warn('Server is not running.');
    return;
  }
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
    log.error({
      message: 'Error establishing database connection:',
      error,
      code: '',
    });
    db.$disconnect();
    process.exit(1);
  });

server = app.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
  startQueuesAndCrons();
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
