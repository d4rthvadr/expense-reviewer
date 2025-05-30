import { Category } from '@domain/enum/category.enum';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseItemDataInput {
  id?: string;
  name: string;
  description?: string;
  category: Category;
  amount: number;
  qty?: number;
}

export class ExpenseItemModel {
  readonly #id: string;
  #name: string;
  #description?: string;
  #category: Category;
  #amount: number;
  #qty?: number;

  constructor(data: ExpenseItemDataInput) {
    const { id = uuidv4(), name, description, amount, category, qty } = data;
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#category = category;
    this.#amount = amount;
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

  get qty(): number | undefined {
    return this.#qty;
  }

  set qty(value: number) {
    this.#qty = value;
  }

  get category(): Category {
    return this.#category;
  }
  set category(value: Category) {
    this.#category = value;
  }
}
