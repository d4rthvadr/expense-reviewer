import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import { RecurringTemplateModel } from '@domain/models/recurring-template.model';
import {
  mapRecurringTemplate,
  RecurringTemplateEntity,
} from './helpers/map-recurring-template';
import {
  RecurringTemplateType as PrismaRecurringTemplateType,
  RecurringPeriod as PrismaRecurringPeriod,
  Category as PrismaCategory,
  Currency as PrismaCurrency,
} from '../../../generated/prisma';
import { QueryParams } from '@domain/services/interfaces/query-params';
import { RecurringTemplateFilters } from '@domain/services/interfaces/recurring-template-filters';

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
    data: QueryParams<RecurringTemplateFilters>,
    userId: string
  ): Promise<{ data: RecurringTemplateModel[]; total: number }> {
    try {
      const [templates, total] = await Promise.all([
        this.recurringTemplate.findMany({
          where: {
            ...data.filters,
            userId,
          },
          take: data.limit,
          skip: data.offset,
          orderBy: {
            [data.sort.sortBy]: data.sort.sortDir,
          },
        }),
        this.recurringTemplate.count(),
      ]);

      return {
        data: templates.map((template) => mapRecurringTemplate(template)),
        total,
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
