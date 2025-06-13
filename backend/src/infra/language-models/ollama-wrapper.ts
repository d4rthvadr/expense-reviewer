import { AgentWrapper } from '@domain/interfaces/agent-wrapper.interface';
import { log } from '@infra/logger';
import ollama, { Message } from 'ollama';

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

class OllamaWrapper implements AgentWrapper {
  model: string = 'llama3';

  async create(messages: Message[]): Promise<string> {
    const response = await ollama.chat({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messages,
      ],
    });

    const parsedResponse = parseResponse(response.message.content);

    if (typeof parsedResponse !== 'string') {
      throw new Error('Response is not a string');
    }

    return parsedResponse;
  }
}

export { OllamaWrapper, AgentWrapper };
