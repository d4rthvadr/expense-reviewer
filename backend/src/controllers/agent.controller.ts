import { log } from '../libs/logger';
import { AgentService } from '../domain/services/agent.service';
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
      const agentResponse = await this.#agentService.extractTableData(text);

      res.send({ data: agentResponse });
    } catch (error) {
      log.error({ message: 'Error processing text:', error, code: '' });
      res.status(500).send({
        error: { message: 'Failed to process text', data: null },
      });
    }
  };
}
