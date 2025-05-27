import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { agentRoutes, budgetRoutes, expenseRoutes, userRoutes } from './routes';
import { requestErrorHandler } from './routes/utils/request-error-handler';
import swaggerOptions from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { log } from './libs/logger';
import { getRedisInstance } from './db/ioredis-singleton';

getRedisInstance().ping((err) => {
  if (err) {
    log.error({
      message: '[peek] Error connecting to Redis:',
      code: '',
      error: err,
    });
  } else {
    log.info('Connected to Redis:');
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Api routes
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
});

app.use(requestErrorHandler);

export { app };
