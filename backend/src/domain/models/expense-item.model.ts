import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseItemDataInput {
  id?: string;
  name: string;
  description?: string;
  category: Category;
  currency?: Currency;
  amount: number;
  amountUsd: number;
  qty?: number;
}

export class ExpenseItemModel {
  readonly #id: string;
  #name: string;
  #description?: string;
  #category: Category;
  #currency?: Currency;
  #amount: number;
  #amountUsd: number;
  #qty?: number;

  constructor(data: ExpenseItemDataInput) {
    const {
      id = uuidv4(),
      name,
      description,
      amount,
      amountUsd,
      category,
      currency = Currency.USD,
      qty,
    } = data;
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#category = category;
    this.#currency = currency;
    this.#amount = amount;
    this.#amountUsd = amountUsd;
    this.#qty = qty;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
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
}
