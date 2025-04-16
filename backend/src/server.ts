import { app } from './app';
import { Server } from 'http';

let server: Server;
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);
