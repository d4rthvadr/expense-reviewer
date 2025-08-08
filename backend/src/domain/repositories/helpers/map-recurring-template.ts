import { RecurringTemplateModel } from '@domain/models/recurring-template.model';
import { convertNullToUndefined, convertToFamilyType } from './utils';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { RecurringPeriod } from '@domain/enum/recurring-period.enum';
import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';

// Type for RecurringTemplate entity from Prisma
export interface RecurringTemplateEntity {
  id: string;
  name: string | null;
  userId: string | null;
  type: string;
  amount: number;
  isRecurring: boolean;
  recurringPeriod: string | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  currency: string | null;
  category: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapRecurringTemplate(
  entity: RecurringTemplateEntity
): RecurringTemplateModel;
export function mapRecurringTemplate(entity: null): null;
export function mapRecurringTemplate(
  entity: RecurringTemplateEntity | null
): RecurringTemplateModel | null;
export function mapRecurringTemplate(
  entity: RecurringTemplateEntity | null
): RecurringTemplateModel | null {
  if (!entity) {
    return null;
  }

  return new RecurringTemplateModel({
    id: entity.id,
    name: convertNullToUndefined(entity.name),
    userId: convertNullToUndefined(entity.userId),
    type: convertToFamilyType(entity.type, RecurringTemplateType),
    amount: entity.amount,
    isRecurring: entity.isRecurring,
    recurringPeriod: convertToFamilyType(
      convertNullToUndefined(entity.recurringPeriod),
      RecurringPeriod
    ),
    startDate: entity.startDate,
    endDate: convertNullToUndefined(entity.endDate),
    isActive: entity.isActive,
    currency: convertToFamilyType(
      convertNullToUndefined(entity.currency),
      Currency
    ),
    category: convertToFamilyType(entity.category, Category),
    description: convertNullToUndefined(entity.description),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
