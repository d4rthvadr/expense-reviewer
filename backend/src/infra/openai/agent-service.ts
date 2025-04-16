import { buildPrompt } from './prompt-builder';
import { AgentWrapper, agentWrapper } from './agent-wrapper';

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

const agentService = new AgentService(agentWrapper);
export { agentService };
