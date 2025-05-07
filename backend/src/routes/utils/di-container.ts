import OpenAI from 'openai';
import { AgentController } from '../../controllers/agent.controller';
import { AgentService } from '../../infra/openai/agent-service';
import { OpenAiAgentWrapper } from '../../infra/openai/agent-wrapper';
import { createOpenAiFactory } from '../../libs/open-ai';
import { UserController } from '../../controllers/user.controller';
import { UserService } from '../../domain/services/user.service';
import { UserRepository } from '../../domain/repositories/user.repository';

class DependencyInjectionContainer {
  // clients
  #openAiClient: OpenAI;
  // wrappers
  #agentWrapper: OpenAiAgentWrapper | null = null;
  // services
  #agentService: AgentService | null = null;
  #userService: UserService | null = null;
  // repositories
  #userRepository: UserRepository | null = null;
  // controllers
  #agentController: AgentController | null = null;
  #userController: UserController | null = null;

  constructor(openAiClient: OpenAI) {
    this.#openAiClient = openAiClient;
  }

  // wrappers
  get agentWrapper() {
    if (!this.#agentWrapper) {
      this.#agentWrapper = new OpenAiAgentWrapper(this.#openAiClient);
    }
    return this.#agentWrapper;
  }

  // services
  get agentService() {
    if (!this.#agentService) {
      this.#agentService = new AgentService(this.agentWrapper);
    }
    return this.#agentService;
  }

  get userService() {
    if (!this.#userService) {
      this.#userService = new UserService(this.userRepository);
    }
    return this.#userService;
  }
  // controllers

  get agentController() {
    if (!this.#agentController) {
      this.#agentController = new AgentController(this.agentService);
    }
    return this.#agentController;
  }

  get userController() {
    if (!this.#userController) {
      this.#userController = new UserController(this.userService);
    }
    return this.#userController;
  }

  // repositories
  get userRepository() {
    if (!this.#userRepository) {
      this.#userRepository = new UserRepository();
    }
    return this.#userRepository;
  }
}

const client: OpenAI | undefined = createOpenAiFactory(
  process.env.OPENAI_API_KEY!
);

if (!client) {
  throw new Error(
    'OpenAI client is not created. Check if the API key is valid.'
  );
}

export const dependencyInjectionContainer = new DependencyInjectionContainer(
  client
);
