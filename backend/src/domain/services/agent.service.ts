import { log } from '@infra/logger';
import { AgentWrapper } from '../interfaces/agent-wrapper.interface';
import ollama, { ChatResponse } from 'ollama';

export class AgentService {
  // eslint-disable-next-line no-unused-private-class-members
  #agentWrapper?: AgentWrapper;

  constructor(agentWrapper?: AgentWrapper) {
    this.#agentWrapper = agentWrapper;
  }

  /**
   * Generates an AI response based on the provided prompt using the Ollama client.
   *
   * This method sends the prompt to the AI model (llama3) and returns the generated response.
   * It logs the execution start time, the prompt, the AI's response, and the total execution time.
   *
   * @param prompt - The user's input or question to be sent to the AI model.
   * @returns A promise that resolves to the AI-generated response as a string.
   *
   * @remarks
   * - Currently, this method directly uses the Ollama client. In the future, consider wrapping this call
   *   with an AgentWrapper to support multiple providers.
   * - Logs are generated for debugging and performance monitoring purposes.
   */
  async generateAIResponse(prompt: string): Promise<string> {
    // TODO: Wrap this call with your AgentWrapper to handle different providers
    // For now, we'll directly use the ollama client
    const { response, startTime, endTime } = await this.executePrompt(prompt);

    const logMetaData = this.generateLogMetadata(response, startTime, endTime);
    log.info(
      `Response from Ollama: ${response.message.content} | meta: ${JSON.stringify(logMetaData)}`
    );

    return response.message.content;
  }

  private async executePrompt(prompt: string) {
    const startTime = Date.now();
    log.info(
      `Starting prompt execution at ${new Date(startTime).toISOString()} with prompt: ${prompt}`
    );

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const endTime = Date.now();
    return { response, startTime, endTime };
  }

  /**
   * Generates metadata for logging the details of a chat response operation.
   *
   * @param response - The chat response object containing evaluation counts, timestamps, and status information.
   * @param startTime - The timestamp (in milliseconds) when the operation started.
   * @param endTime - The timestamp (in milliseconds) when the operation ended.
   * @returns An object containing metadata such as duration, token counts, system information, and additional response details.
   */
  private generateLogMetadata(
    response: ChatResponse,
    startTime: number,
    endTime: number
  ) {
    const durationMs = endTime - startTime;
    const durationSeconds = Math.round(durationMs / 1000);

    const logMetaData = {
      durationMs,
      durationSeconds,
      promptTokens: response.prompt_eval_count || 'N/A',
      responseTokens: response.eval_count || 'N/A',
      totalTokens:
        (response.prompt_eval_count || 0) + (response.eval_count || 0),
      // System information
      loadDuration: response.load_duration || 'N/A',
      // Additional metadata
      createdAt: response.created_at,
      done: response.done,
      doneReason: response.done_reason || 'N/A',
    };
    return logMetaData;
  }
}

export const agentService = new AgentService();
