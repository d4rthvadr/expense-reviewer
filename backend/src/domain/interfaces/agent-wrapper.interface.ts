export abstract class AgentWrapper {
  model!: string;

  abstract create(messages: unknown[]): Promise<string | null>;
}
