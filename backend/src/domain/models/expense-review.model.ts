import { v4 as uuidv4 } from 'uuid';

export interface ExpenseItem {
  id: string;
  category: string;
  qty: number;
  currency: string;
  amount: number;
}

interface ExpenseReviewDataInput {
  id?: string;
  reviewText: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  expense?: ExpenseItem[];
}

export class ExpenseReviewModel {
  readonly #id: string;
  #reviewText: string;
  #userId?: string;
  #createdAt: Date;
  #updatedAt: Date;
  #expense?: ExpenseItem[];

  constructor(data: ExpenseReviewDataInput) {
    this.#id = data.id ?? uuidv4();
    this.#reviewText = data.reviewText;
    this.#userId = data.userId;
    this.#createdAt = data.createdAt ?? new Date();
    this.#updatedAt = data.updatedAt ?? new Date();
    this.#expense = data.expense;
  }

  // Getters
  get id(): string {
    return this.#id;
  }

  get reviewText(): string {
    return this.#reviewText;
  }

  set reviewText(value: string) {
    this.#reviewText = value;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  set updatedAt(value: Date) {
    this.#updatedAt = value;
  }

  get expense(): ExpenseItem[] | undefined {
    return this.#expense;
  }

  set expense(value: ExpenseItem[] | undefined) {
    this.#expense = value;
  }

  get userId(): string | undefined {
    return this.#userId;
  }

  set userId(value: string | undefined) {
    this.#userId = value;
  }
}
