import { buildPrompt } from '../../infra/language-models/prompt-builder';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';

export class AgentService {
  #agentWrapper: AgentWrapper;

  constructor(agentWrapper: AgentWrapper) {
    this.#agentWrapper = agentWrapper;
  }

  async extractTableData(text: string): Promise<unknown> {
    const prompt: string = buildPrompt.extractText(text);

    const completion = await this.#agentWrapper.create([
      { role: 'user', content: prompt },
    ]);

    console.log('peek: ', completion);
    return completion;
  }
}
