import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { RecurringPeriod } from '@domain/enum/recurring-period.enum';
import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';
import { RecurringTemplateModel } from '@domain/models/recurring-template.model';

interface RecurringTemplateCreateDataDto {
  name?: string;
  userId?: string;
  type: RecurringTemplateType;
  amount: number;
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  currency?: Currency;
  category: Category;
  description?: string;
  createdAt?: Date;
}

export class RecurringTemplateFactory {
  /**
   * Creates a new RecurringTemplateModel instance from the provided data.
   * @param data - The data to create the recurring template model.
   * @returns A new RecurringTemplateModel instance.
   */
  static createRecurringTemplate(
    data: RecurringTemplateCreateDataDto
  ): RecurringTemplateModel {
    const {
      name,
      userId,
      type,
      amount,
      isRecurring = true,
      recurringPeriod,
      startDate,
      endDate,
      isActive = true,
      currency,
      category,
      description,
      createdAt,
    } = data;

    return new RecurringTemplateModel({
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
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
  }
}
