import { log } from '@libs/logger';
import { buildPrompt } from '../../infra/language-models/prompt-builder';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';
import ollama from 'ollama';

const parseResponse = (response: string): unknown => {
  let parsedResponse = [];
  try {
    parsedResponse = JSON.parse(response);
  } catch (err) {
    log.warn({
      message: 'Error processing response:',
      error: err,
      code: '',
    });
  }

  return parsedResponse;
};

export class AgentService {
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

    return response.message.content;
  }

  async extractTableData2(text: string): Promise<unknown> {
    const prompt: string = buildPrompt.extractTextFromInvoice(text);

    if (!this.#agentWrapper) {
      throw new Error('AgentWrapper is not initialized');
    }

    const completion = await this.#agentWrapper.create([
      { role: 'user', content: prompt },
    ]);

    console.log('peek: ', completion);
    return completion;
  }
}

export const agentService = new AgentService();
