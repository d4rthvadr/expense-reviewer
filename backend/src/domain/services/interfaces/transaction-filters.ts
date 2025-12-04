import { TransactionType } from '@domain/enum/transaction-type.enum';

export interface TransactionFindFilters {
  transactionId?: string;
  type?: TransactionType;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}
