import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';
import { v4 as uuidv4 } from 'uuid';

interface TransactionDataInput {
  id?: string;
  name: string;
  description?: string;
  category: Category;
  currency?: Currency;
  amount: number;
  amountUsd: number;
  type?: TransactionType;
  userId?: string;
  qty?: number;
  createdAt?: Date;
}

export class TransactionModel {
  readonly #id: string;
  #name: string;
  #description?: string;
  #userId?: string;
  #category: Category;
  #currency?: Currency;
  #amount: number;
  #amountUsd: number;
  #type: TransactionType;
  #createdAt: Date;
  #qty?: number;

  constructor(data: TransactionDataInput) {
    const {
      id = uuidv4(),
      name,
      description,
      amount,
      amountUsd,
      category,
      currency = Currency.USD,
      type = TransactionType.EXPENSE,
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
    this.#type = type;
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

  get type(): TransactionType {
    return this.#type;
  }

  set type(value: TransactionType) {
    this.#type = value;
  }

  get qty(): number | undefined {
    if (this.#qty) {
      return this.#qty;
    }
  }

  set qty(value: number | undefined) {
    if (value) {
      this.#qty = value;
    }
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
   * Gets the creation date of the transaction.
   *
   * @returns {Date} The date and time when the transaction was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  set createdAt(value: Date) {
    this.#createdAt = value;
  }
}
