import { v4 as uuidv4 } from 'uuid';

export interface TransactionItem {
  id: string;
  category: string;
  qty: number;
  currency: string;
  amount: number;
  type: string; // EXPENSE or INCOME
}

interface TransactionReviewDataInput {
  id?: string;
  reviewText: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  transactions?: TransactionItem[];
}

export class TransactionReviewModel {
  readonly #id: string;
  #reviewText: string;
  #userId?: string;
  #createdAt: Date;
  #updatedAt: Date;
  #transactions?: TransactionItem[];

  constructor(data: TransactionReviewDataInput) {
    this.#id = data.id ?? uuidv4();
    this.#reviewText = data.reviewText;
    this.#userId = data.userId;
    this.#createdAt = data.createdAt ?? new Date();
    this.#updatedAt = data.updatedAt ?? new Date();
    this.#transactions = data.transactions;
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

  get transactions(): TransactionItem[] | undefined {
    return this.#transactions;
  }

  set transactions(value: TransactionItem[] | undefined) {
    this.#transactions = value;
  }

  get userId(): string | undefined {
    return this.#userId;
  }

  set userId(value: string | undefined) {
    this.#userId = value;
  }
}
