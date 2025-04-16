import Express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { agentService } from '../infra/openai/agent-service';
import { asyncHandler } from './utils/async-handler';

dotenv.config();

const route = Express.Router();

route.post(
  '/process-text',
  asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
      res.status(400).send({ error: 'Text is required' });
      return;
    }

    console.log('Received text: ', text);

    try {
      const response = await agentService.extractTableData(text);

      console.log('peek: ', response);
      res.send({ table: [] });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).send({
        error: { message: 'Failed to process text', data: null },
        error2: error,
      });
    }
  })
);

export default route;
