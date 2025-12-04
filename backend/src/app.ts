import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { clerkMiddleware, getAuth } from '@clerk/express';
import {
  agentRoutes,
  budgetRoutes,
  analyticsRoutes,
  categoryWeightRoutes,
  recurringTemplateRoutes,
  notificationRoutes,
  webhookRoutes,
  transactionRoutes,
  transactionReviewRoutes,
  userRoutes,
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

app.use((req, _, next) => {
  log.info({
    message: `Received request: ${req.method} ${req.originalUrl} | meta: ${JSON.stringify(req.body ?? {})} `,
  });
  next();
});

// Apply Clerk middleware globally with API configuration
app.use(
  clerkMiddleware({
    // Configure for API-only behavior
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

app.use((req: Request, _: Response, next: NextFunction) => {
  const { userId } = getAuth(req);

  if (userId) {
    req.user = { id: userId };
  }

  next();
});

// Custom auth middleware that returns proper 401 responses
const apiAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid token.',
    });
    return;
  }
  next();
};

// Root route for health check
app.get('/health', (_: Request, res: Response) => {
  res.json({
    version: '1.0.0',
  });
});

// Swagger documentation with environment-based protection
if (process.env.NODE_ENV === 'dev') {
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  log.info('Swagger documentation available at /api-docs');
}

// Webhook routes (unprotected, before Clerk middleware)
app.use('/api/webhooks', webhookRoutes);

// Protected API routes - custom auth middleware ensures proper 401 responses
app.use('/api/agents', apiAuth, agentRoutes);
app.use('/api/transactions', apiAuth, transactionRoutes);
app.use('/api/budgets', apiAuth, budgetRoutes);
app.use('/api/analytics', apiAuth, analyticsRoutes);
app.use('/api/users', apiAuth, userRoutes);
app.use('/api/preferences/category-weights', apiAuth, categoryWeightRoutes);
app.use('/api/recurring-templates', apiAuth, recurringTemplateRoutes);
app.use('/api/notifications', apiAuth, notificationRoutes);
app.use('/api/transaction-reviews', apiAuth, transactionReviewRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
});

app.use(requestErrorHandler);

export { app };
