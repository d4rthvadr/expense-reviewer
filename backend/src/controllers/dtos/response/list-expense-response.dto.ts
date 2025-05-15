import { ExpenseResponseDto } from './expense-response.dto';
export interface ListExpenseResponseDto {
  data: ExpenseResponseDto[];
  total: number;
  limit: number;
  offset: number;
}
