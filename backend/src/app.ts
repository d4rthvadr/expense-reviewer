import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { agentRoute } from './routes';

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use([agentRoute]);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export { app };
