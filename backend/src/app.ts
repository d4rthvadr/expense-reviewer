import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { agentRoutes, expenseRoutes, userRoutes } from './routes';
import { requestErrorHandler } from './routes/utils/request-error-handler';
import swaggerOptions from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Api routes
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// app.all('*', (req: Request, res: Response) => {
//   throw new Error(`Route not found: ${req.originalUrl}`);
// });

app.use(requestErrorHandler);

export { app };
