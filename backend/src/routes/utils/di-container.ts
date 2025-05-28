import OpenAI from 'openai';
import { AgentController } from '@controllers/agent.controller';
import { createOpenAiFactory } from '@libs/open-ai';
import { UserController } from '@controllers/user.controller';
import { UserService } from '@domain/services/user.service';
import { UserRepository } from '@domain/repositories/user.repository';
import { ExpenseController } from '@controllers/expense.controller';
import { ExpenseService } from '@domain/services/expense.service';
import { ExpenseRepository } from '@domain/repositories/expense.repository';
import { AgentService } from '@domain/services/agent.service';
import { OpenAiAgentWrapper } from '@infra/language-models/openai-agent-wrapper';
import { BudgetService } from '@domain/services/budget.service';
import { BudgetRepository } from '@domain/repositories/budget.repository';
import { BudgetController } from '@controllers/budget.controller';
import { OllamaWrapper } from '@infra/language-models/ollama-wrapper';

class DependencyInjectionContainer {
  // clients
  #openAiClient: OpenAI;
  // wrappers
  #openAiWrapper: OpenAiAgentWrapper | null = null;
  #ollamaWrapper: OllamaWrapper | null = null;
  // services
  #agentService: AgentService | null = null;
  #userService: UserService | null = null;
  #expenseService: ExpenseService | null = null;
  #budgetService: BudgetService | null = null;
  // repositories
  #userRepository: UserRepository | null = null;
  #expenseRepository: ExpenseRepository | null = null;
  #budgetRepository: BudgetRepository | null = null;
  // controllers
  #agentController: AgentController | null = null;
  #userController: UserController | null = null;
  #expenseController: ExpenseController | null = null;
  #budgetController: BudgetController | null = null;

  constructor(openAiClient: OpenAI) {
    this.#openAiClient = openAiClient;
  }

  // wrappers
  get openAiWrapper() {
    if (!this.#openAiWrapper) {
      this.#openAiWrapper = new OpenAiAgentWrapper(this.#openAiClient);
    }
    return this.#openAiWrapper;
  }
  get ollamaWrapper() {
    if (!this.#ollamaWrapper) {
      this.#ollamaWrapper = new OllamaWrapper();
    }
    return this.#ollamaWrapper;
  }

  // services
  get agentService() {
    if (!this.#agentService) {
      this.#agentService = new AgentService(this.openAiWrapper);
    }
    return this.#agentService;
  }

  get userService() {
    if (!this.#userService) {
      this.#userService = new UserService(this.userRepository);
    }
    return this.#userService;
  }
  get expenseService() {
    if (!this.#expenseService) {
      this.#expenseService = new ExpenseService(this.expenseRepository);
    }
    return this.#expenseService;
  }

  get budgetService() {
    if (!this.#budgetService) {
      this.#budgetService = new BudgetService(this.budgetRepository);
    }
    return this.#budgetService;
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

  get expenseController() {
    if (!this.#expenseController) {
      this.#expenseController = new ExpenseController(this.expenseService);
    }
    return this.#expenseController;
  }

  get budgetController() {
    if (!this.#budgetController) {
      this.#budgetController = new BudgetController(this.budgetService);
    }
    return this.#budgetController;
  }

  // repositories
  get userRepository() {
    if (!this.#userRepository) {
      this.#userRepository = new UserRepository();
    }
    return this.#userRepository;
  }
  get expenseRepository() {
    if (!this.#expenseRepository) {
      this.#expenseRepository = new ExpenseRepository();
    }
    return this.#expenseRepository;
  }

  get budgetRepository() {
    if (!this.#budgetRepository) {
      this.#budgetRepository = new BudgetRepository();
    }
    return this.#budgetRepository;
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
