import { db } from './db/database';
import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { Server } from 'http';

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
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

connectToDb()
  .then(() => {
    console.log('Database connection established.');
  })
  .catch((error) => {
    console.error('Error establishing database connection:', error);
    db.$disconnect();
    process.exit(1);
  });

server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
