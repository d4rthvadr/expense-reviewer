import { log } from '../../libs/logger';
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
  #agentWrapper: AgentWrapper;

  constructor(agentWrapper: AgentWrapper) {
    this.#agentWrapper = agentWrapper;
  }

  async extractTableData(text: string): Promise<unknown> {
    const prompt: string = buildPrompt.extractTextFromInvoice(text);
    log.info(`Extracting table data with prompt: ${prompt}`);

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsedResponse = parseResponse(response.message.content);

    if (typeof parsedResponse !== 'string') {
      throw new Error('Response is not a string');
    }

    return parseResponse;
  }

  async extractTableData2(text: string): Promise<unknown> {
    const prompt: string = buildPrompt.extractTextFromInvoice(text);

    const completion = await this.#agentWrapper.create([
      { role: 'user', content: prompt },
    ]);

    console.log('peek: ', completion);
    return completion;
  }
}
