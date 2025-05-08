import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { agentRoutes, expenseRoutes, userRoutes } from './routes';
import { requestErrorHandler } from './routes/utils/request-error-handler';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Api routes
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// app.all('*', (req: Request, res: Response) => {
//   throw new Error(`Route not found: ${req.originalUrl}`);
// });

app.use(requestErrorHandler);

export { app };
