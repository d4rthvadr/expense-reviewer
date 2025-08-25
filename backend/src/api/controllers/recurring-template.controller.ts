import { Response, Request } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import { log } from '@infra/logger';
import {
  recurringTemplateService,
  RecurringTemplateService,
} from '@domain/services/recurring-template.service';
import { CreateRecurringTemplateRequestDto } from './dtos/request/create-recurring-template-request.dto';
import { UpdateRecurringTemplateRequestDto } from './dtos/request/update-recurring-template-request.dto';
import { RecurringTemplateResponseDto } from './dtos/response/recurring-template-response.dto';
import { parseQueryParams } from './utils/parse-query-options';
import { RecurringTemplateFilters } from '@domain/services/interfaces/recurring-template-filters';

export class RecurringTemplateController {
  readonly #recurringTemplateService: RecurringTemplateService;

  constructor(recurringTemplateService: RecurringTemplateService) {
    this.#recurringTemplateService = recurringTemplateService;
  }

  create = async (
    req: RequestBodyType<CreateRecurringTemplateRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating recurring template with data | meta: ${JSON.stringify(req.body)}`
    );

    // Convert string dates to Date objects
    const requestData = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      // TODO: Extract userId from authentication context
      userId: undefined,
    };

    const createdTemplateDto: RecurringTemplateResponseDto =
      await this.#recurringTemplateService.create(requestData);

    res.status(201).json(createdTemplateDto);
  };

  update = async (
    req: Request<
      { templateId: string },
      unknown,
      UpdateRecurringTemplateRequestDto,
      unknown
    >,
    res: Response
  ) => {
    const templateId: string = req.params.templateId;
    log.info(`Updating recurring template with id ${templateId}`);

    // Convert string dates to Date objects
    const requestData = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };

    const updatedTemplateDto: RecurringTemplateResponseDto =
      await this.#recurringTemplateService.update(templateId, requestData);

    res.status(200).json(updatedTemplateDto);
  };

  findOne = async (
    req: Request<{ templateId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const templateId: string = req.params.templateId;
    log.info(`Finding recurring template with id ${templateId}`);

    const templateDto: RecurringTemplateResponseDto =
      await this.#recurringTemplateService.findById(templateId);

    res.status(200).json(templateDto);
  };

  find = async (req: Request, res: Response) => {
    const parsedQuery = parseQueryParams<RecurringTemplateFilters>(
      req,
      (req) => {
        const filters: RecurringTemplateFilters = {};
        if (req.query.isActive) {
          filters.isActive =
            req.query.isActive === 'true'
              ? true
              : req.query.isActive === 'false'
                ? false
                : undefined;
        }
        return filters;
      }
    );
    log.info(
      `Finding recurring templates with filters | meta: ${JSON.stringify(parsedQuery)}`
    );

    const templatesDto = await this.#recurringTemplateService.find(
      parsedQuery,
      req.user.id
    );

    res.status(200).json(templatesDto);
  };

  delete = async (
    req: Request<{ templateId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const templateId: string = req.params.templateId;
    log.info(`Deleting recurring template with id ${templateId}`);

    await this.#recurringTemplateService.delete(templateId);

    res.status(204).send();
  };

  findByUserId = async (
    req: Request<{ userId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const userId: string = req.params.userId;
    log.info(`Finding recurring templates for user ${userId}`);

    const templatesDto =
      await this.#recurringTemplateService.findByUserId(userId);

    res.status(200).json(templatesDto);
  };

  findActiveByType = async (
    req: Request<unknown, unknown, unknown, { type: string; userId?: string }>,
    res: Response
  ) => {
    const { type, userId } = req.query;
    log.info(
      `Finding active recurring templates by type ${type} for user ${userId}`
    );

    if (!type) {
      return res.status(400).json({
        error: 'Type parameter is required',
      });
    }

    const templatesDto = await this.#recurringTemplateService.findActiveByType(
      type,
      userId
    );

    res.status(200).json(templatesDto);
  };
}

export const recurringTemplateController = new RecurringTemplateController(
  recurringTemplateService
);
