import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';

export interface RecurringTemplateFilters {
  userId?: string;
  type?: RecurringTemplateType;
  isActive?: boolean;
}
