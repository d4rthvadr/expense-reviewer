import { AgentService } from '../domain/services/agent-service';
import { Request, Response } from 'express';

export class AgentController {
  #agentService: AgentService;
  constructor(agentService: AgentService) {
    this.#agentService = agentService;
  }
  processText = async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
      res.status(400).send({ error: 'Text is required' });
      return;
    }

    try {
      const response = await this.#agentService.extractTableData(text);

      console.log('peek: ', response);
      res.send({ table: [] });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).send({
        error: { message: 'Failed to process text', data: null },
        error2: error,
      });
    }
  };
}
