import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseDataInput {
  id?: string;
  name: string;
  description?: string;
  category: Category;
  currency?: Currency;
  amount: number;
  amountUsd: number;
  userId?: string;
  qty?: number;
  createdAt?: Date;
}

export class ExpenseModel {
  readonly #id: string;
  #name: string;
  #description?: string;
  #userId?: string;
  #category: Category;
  #currency?: Currency;
  #amount: number;
  #amountUsd: number;
  #createdAt: Date;
  #qty?: number;

  constructor(data: ExpenseDataInput) {
    const {
      id = uuidv4(),
      name,
      description,
      amount,
      amountUsd,
      category,
      currency = Currency.USD,
      userId,
      createdAt = new Date(),
      qty,
    } = data;
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#category = category;
    this.#currency = currency;
    this.#amount = amount;
    this.#amountUsd = amountUsd;
    this.#userId = userId;
    this.#qty = qty;
    this.#createdAt = createdAt;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string | undefined {
    return this.#name;
  }

  set name(value: string | undefined) {
    if (!value) {
      return;
    }
    this.#name = value;
  }

  get description(): string | undefined {
    return this.#description;
  }

  set description(value: string | undefined) {
    this.#description = value;
  }

  get amount(): number {
    return this.#amount;
  }

  set amount(value: number) {
    this.#amount = value;
  }

  set amountUsd(value: number) {
    this.#amountUsd = value;
  }

  get amountUsd(): number {
    return this.#amountUsd;
  }

  get qty(): number | undefined {
    return this.#qty;
  }

  set qty(value: number) {
    this.#qty = value;
  }

  get currency(): Currency | undefined {
    return this.#currency;
  }
  set currency(value: Currency | undefined) {
    this.#currency = value;
  }

  get category(): Category {
    return this.#category;
  }
  set category(value: Category) {
    this.#category = value;
  }

  get userId(): string | undefined {
    return this.#userId;
  }

  set userId(value: string | undefined) {
    if (value) {
      this.#userId = value;
    }
  }

  /**
   * Gets the creation date of the expense item.
   *
   * @returns {Date} The date and time when the expense item was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  set createdAt(value: Date) {
    this.#createdAt = value;
  }
}
