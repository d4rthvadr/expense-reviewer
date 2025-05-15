export interface ExpenseItem {
  name: string;
  amount: number;
  description?: string;
  qty?: number;
}

export interface CreateExpenseRequestDto {
  name?: string;
  type: string;
  items: ExpenseItem[];
}
