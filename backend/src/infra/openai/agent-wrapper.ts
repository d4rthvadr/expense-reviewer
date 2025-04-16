import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import OpenAi from 'openai';
import { openai } from '../../libs/open-ai';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';

class OpenAiAgentWrapper implements AgentWrapper {
  #openai: OpenAi;
  model: string = 'gpt-4.1';

  constructor(openai: OpenAi) {
    this.#openai = openai;
  }

  async create(messages: ChatCompletionMessageParam[]): Promise<unknown> {
    const completion = await this.#openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messages,
      ],
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  }
}

const agentWrapper = new OpenAiAgentWrapper(openai);
export { agentWrapper, AgentWrapper };
