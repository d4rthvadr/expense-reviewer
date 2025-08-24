import { log } from '@infra/logger';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';
import ollama from 'ollama';

export class AgentService {
  // eslint-disable-next-line no-unused-private-class-members
  #agentWrapper?: AgentWrapper;

  constructor(agentWrapper?: AgentWrapper) {
    this.#agentWrapper = agentWrapper;
  }

  async generateAIResponse(prompt: string): Promise<string> {
    // TODO: Wrap this call with your AgentWrapper to handle different providers
    // For now, we'll directly use the ollama client
    const startTime = Date.now();
    log.info(
      `Starting prompt execution at ${new Date(startTime).toISOString()}`
    );
    log.info(`Executing prompt: ${prompt}`);

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    log.info(`Response from Ollama: ${response.message.content}`);

    const endTime = Date.now();

    log.info(
      `Total execution time: ${endTime - startTime} ms: ${Math.round((endTime - startTime) / 1000)} seconds at endTTime ${new Date(endTime).toISOString()}`
    );

    return response.message.content;
  }
}

export const agentService = new AgentService();
