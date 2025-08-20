import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
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
import { log } from '@infra/logger';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  log.info({
    message: `Headers: ${JSON.stringify(req.headers)}`,
  });
  log.info({
    message: `Received request: ${req.method} ${req.originalUrl} | meta: ${JSON.stringify(req.body)} | headers: ${JSON.stringify(req.headers)}`,
  });
  next();
});

// Apply Clerk middleware globally
app.use(clerkMiddleware());

app.use((req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);
  req.user = { id: userId ?? undefined }; // Ensure userId is optional
  next();
});

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
app.use('/api/users', requireAuth(), userRoutes);
app.use('/api/expenses', requireAuth(), expenseRoutes);
app.use('/api/budgets', requireAuth(), budgetRoutes);
app.use('/api/analytics', requireAuth(), analyticsRoutes);
app.use('/api/recurring-templates', requireAuth(), recurringTemplateRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
});

app.use(requestErrorHandler);

export { app };
