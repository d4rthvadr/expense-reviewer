import { log } from '@infra/logger';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';
import ollama from 'ollama';

export class AgentService {
  // eslint-disable-next-line no-unused-private-class-members
  #agentWrapper?: AgentWrapper;

  constructor(agentWrapper?: AgentWrapper) {
    this.#agentWrapper = agentWrapper;
  }

  async extractTableData(prompt: string): Promise<string> {
    log.info(`Executing prompt: ${prompt}`);

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    log.info(`Response from Ollama: ${response.message.content}`);

    return response.message.content;
  }
}

export const agentService = new AgentService();
