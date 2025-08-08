import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import { RecurringTemplateModel } from '@domain/models/recurring-template.model';
import {
  mapRecurringTemplate,
  RecurringTemplateEntity,
} from './helpers/map-recurring-template';
import { PaginatedResultDto } from '../../api/controllers/dtos/response/paginated-response.dto';
import {
  RecurringTemplateType as PrismaRecurringTemplateType,
  RecurringPeriod as PrismaRecurringPeriod,
  Category as PrismaCategory,
  Currency as PrismaCurrency,
} from '../../../generated/prisma';

interface ListRecurringTemplateDto {
  userId?: string;
  type?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class RecurringTemplateRepository extends Database {
  async save(data: RecurringTemplateModel): Promise<RecurringTemplateModel> {
    try {
      const template: RecurringTemplateEntity =
        await this.recurringTemplate.upsert({
          where: {
            id: data.id,
          },
          create: {
            id: data.id,
            name: data.name,
            userId: data.userId,
            type: data.type as unknown as PrismaRecurringTemplateType,
            amount: data.amount,
            isRecurring: data.isRecurring,
            recurringPeriod:
              data.recurringPeriod as unknown as PrismaRecurringPeriod,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive,
            currency: data.currency as unknown as PrismaCurrency,
            category: data.category as unknown as PrismaCategory,
            description: data.description,
            createdAt: data.createdAt,
          },
          update: {
            name: data.name,
            userId: data.userId,
            type: data.type as unknown as PrismaRecurringTemplateType,
            amount: data.amount,
            isRecurring: data.isRecurring,
            recurringPeriod:
              data.recurringPeriod as unknown as PrismaRecurringPeriod,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive,
            currency: data.currency as unknown as PrismaCurrency,
            category: data.category as unknown as PrismaCategory,
            description: data.description,
            updatedAt: new Date(),
          },
        });

      return mapRecurringTemplate(template);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving recurring template:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async findById(id: string): Promise<RecurringTemplateModel | null> {
    try {
      const template = await this.recurringTemplate.findUnique({
        where: {
          id,
        },
      });

      return mapRecurringTemplate(template);
    } catch (error) {
      log.error({
        message: 'An error occurred while finding recurring template by id:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async find(
    params: ListRecurringTemplateDto
  ): Promise<PaginatedResultDto<RecurringTemplateModel>> {
    try {
      const { userId, type, isActive, limit = 10, offset = 0 } = params;

      interface WhereClause {
        userId?: string;
        type?: PrismaRecurringTemplateType;
        isActive?: boolean;
      }
      const where: WhereClause = {};
      if (userId) where.userId = userId;
      if (type) where.type = type as PrismaRecurringTemplateType;
      if (isActive !== undefined) where.isActive = isActive;

      const [templates, total] = await Promise.all([
        this.recurringTemplate.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.recurringTemplate.count({
          where,
        }),
      ]);

      const mappedTemplates = templates
        .map(mapRecurringTemplate)
        .filter(
          (template): template is RecurringTemplateModel => template !== null
        );

      return {
        data: mappedTemplates,
        total,
        limit,
        offset,
      };
    } catch (error) {
      log.error({
        message: 'An error occurred while finding recurring templates:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async findByUserId(userId: string): Promise<RecurringTemplateModel[]> {
    try {
      const templates = await this.recurringTemplate.findMany({
        where: {
          userId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return templates
        .map(mapRecurringTemplate)
        .filter(
          (template): template is RecurringTemplateModel => template !== null
        );
    } catch (error) {
      log.error({
        message:
          'An error occurred while finding recurring templates by user id:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.recurringTemplate.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      log.error({
        message: 'An error occurred while deleting recurring template:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async findActiveByType(
    type: string,
    userId?: string
  ): Promise<RecurringTemplateModel[]> {
    try {
      const where = {
        type: type as PrismaRecurringTemplateType,
        isActive: true,
        ...(userId && { userId }),
      };

      const templates = await this.recurringTemplate.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return templates
        .map(mapRecurringTemplate)
        .filter(
          (template): template is RecurringTemplateModel => template !== null
        );
    } catch (error) {
      log.error({
        message:
          'An error occurred while finding active recurring templates by type:',
        error,
        code: '',
      });

      throw error;
    }
  }
}
