import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { clerkMiddleware } from '@clerk/express';
import {
  agentRoutes,
  budgetRoutes,
  expenseRoutes,
  userRoutes,
  analyticsRoutes,
  recurringTemplateRoutes,
  webhookRoutes,
} from './api/routes';
import { requestErrorHandler } from './api/routes/utils/request-error-handler';
import swaggerOptions from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply Clerk middleware globally
app.use(clerkMiddleware());

// Root route for health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Expense Tracker API is running',
    version: '1.0.0',
  });
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Webhook routes (unprotected, before Clerk middleware)
app.use('/api/webhooks', webhookRoutes);

// Protected API routes - requireAuth() ensures user is authenticated
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recurring-templates', recurringTemplateRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
});

app.use(requestErrorHandler);

export { app };
