import { log } from '@infra/logger';
import { RecurringTemplateRepository } from '@domain/repositories/recurring-template.repository';
import { RecurringTemplateFactory } from '@domain/factories/recurring-template.factory';
import { RecurringTemplateModel } from '@domain/models/recurring-template.model';
import { CreateRecurringTemplateDto } from './dtos/create-recurring-template.dto';
import { UpdateRecurringTemplateDto } from './dtos/update-recurring-template.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { RecurringTemplateResponseDto } from '@api/controllers/dtos/response/recurring-template-response.dto';
import { PaginatedResultDto } from '@api/controllers/dtos/response/paginated-response.dto';

interface ListRecurringTemplateParams {
  userId?: string;
  type?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class RecurringTemplateService {
  readonly #recurringTemplateRepository: RecurringTemplateRepository;

  constructor(recurringTemplateRepository: RecurringTemplateRepository) {
    this.#recurringTemplateRepository = recurringTemplateRepository;
  }

  /**
   * Creates a new recurring template using the provided data.
   */
  async create(
    data: CreateRecurringTemplateDto
  ): Promise<RecurringTemplateResponseDto> {
    log.info(
      `Creating recurring template with data | meta: ${JSON.stringify(data)}`
    );

    const templateModel =
      RecurringTemplateFactory.createRecurringTemplate(data);

    const createdTemplate: RecurringTemplateModel =
      await this.#recurringTemplateRepository.save(templateModel);

    log.info(
      `Recurring template created | meta: ${JSON.stringify(createdTemplate)}`
    );
    return this.#toRecurringTemplateDto(createdTemplate);
  }

  /**
   * Updates an existing recurring template.
   */
  async update(
    id: string,
    data: UpdateRecurringTemplateDto
  ): Promise<RecurringTemplateResponseDto> {
    log.info(
      `Updating recurring template ${id} | meta: ${JSON.stringify(data)}`
    );

    const existingTemplate =
      await this.#recurringTemplateRepository.findById(id);
    if (!existingTemplate) {
      throw new ResourceNotFoundException('Recurring template not found');
    }

    // Update fields
    if (data.name !== undefined) existingTemplate.name = data.name;
    if (data.type !== undefined) existingTemplate.type = data.type;
    if (data.amount !== undefined) existingTemplate.amount = data.amount;
    if (data.isRecurring !== undefined)
      existingTemplate.isRecurring = data.isRecurring;
    if (data.recurringPeriod !== undefined)
      existingTemplate.recurringPeriod = data.recurringPeriod;
    if (data.startDate !== undefined)
      existingTemplate.startDate = data.startDate;
    if (data.endDate !== undefined) existingTemplate.endDate = data.endDate;
    if (data.isActive !== undefined) existingTemplate.isActive = data.isActive;
    if (data.currency !== undefined) existingTemplate.currency = data.currency;
    if (data.category !== undefined) existingTemplate.category = data.category;
    if (data.description !== undefined)
      existingTemplate.description = data.description;

    const updatedTemplate: RecurringTemplateModel =
      await this.#recurringTemplateRepository.save(existingTemplate);

    log.info(
      `Recurring template updated | meta: ${JSON.stringify(updatedTemplate)}`
    );
    return this.#toRecurringTemplateDto(updatedTemplate);
  }

  /**
   * Finds a recurring template by its ID.
   */
  async findById(id: string): Promise<RecurringTemplateResponseDto> {
    log.info(`Finding recurring template by id: ${id}`);

    const template = await this.#recurringTemplateRepository.findById(id);
    if (!template) {
      throw new ResourceNotFoundException('Recurring template not found');
    }

    return this.#toRecurringTemplateDto(template);
  }

  /**
   * Finds recurring templates with pagination and filtering.
   */
  async find(
    params: ListRecurringTemplateParams
  ): Promise<PaginatedResultDto<RecurringTemplateResponseDto>> {
    log.info(`Finding recurring templates | meta: ${JSON.stringify(params)}`);

    const result = await this.#recurringTemplateRepository.find(params);

    return {
      ...result,
      data: result.data.map(this.#toRecurringTemplateDto),
    };
  }

  /**
   * Finds all active recurring templates for a user.
   */
  async findByUserId(userId: string): Promise<RecurringTemplateResponseDto[]> {
    log.info(`Finding recurring templates for user: ${userId}`);

    const templates =
      await this.#recurringTemplateRepository.findByUserId(userId);

    return templates.map(this.#toRecurringTemplateDto);
  }

  /**
   * Finds all active recurring templates by type.
   */
  async findActiveByType(
    type: string,
    userId?: string
  ): Promise<RecurringTemplateResponseDto[]> {
    log.info(
      `Finding active recurring templates by type: ${type} for user: ${userId}`
    );

    const templates = await this.#recurringTemplateRepository.findActiveByType(
      type,
      userId
    );

    return templates.map(this.#toRecurringTemplateDto);
  }

  /**
   * Deletes a recurring template by its ID.
   */
  async delete(id: string): Promise<void> {
    log.info(`Deleting recurring template: ${id}`);

    const template = await this.#recurringTemplateRepository.findById(id);
    if (!template) {
      throw new ResourceNotFoundException('Recurring template not found');
    }

    await this.#recurringTemplateRepository.delete(id);
    log.info(`Recurring template deleted: ${id}`);
  }

  /**
   * Converts a RecurringTemplateModel to a RecurringTemplateResponseDto.
   */
  #toRecurringTemplateDto(
    data: RecurringTemplateModel
  ): RecurringTemplateResponseDto {
    const {
      id,
      name,
      userId,
      type,
      amount,
      isRecurring,
      recurringPeriod,
      startDate,
      endDate,
      isActive,
      currency,
      category,
      description,
      createdAt,
      updatedAt,
    } = data;

    return {
      id,
      name,
      userId,
      type,
      amount,
      isRecurring,
      recurringPeriod,
      startDate,
      endDate,
      isActive,
      currency,
      category,
      description,
      createdAt,
      updatedAt,
    };
  }
}

// Create service instance
export const recurringTemplateService = new RecurringTemplateService(
  new RecurringTemplateRepository()
);
