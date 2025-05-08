export interface ExpenseItem {
  name: string;
  description?: string;
  amount: number;
  qty?: number;
}

export interface CreateExpenseDto {
  name?: string;
  type: string;
  items: ExpenseItem[];
}
