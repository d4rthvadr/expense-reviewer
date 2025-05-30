import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { v4 as uuidv4 } from 'uuid';

interface BudgetDataInput {
  id?: string;
  name?: string;
  amount: number;
  userId?: string;
  category: Category;
  currency?: Currency;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BudgetModel {
  readonly #id: string;
  #name?: string;
  #amount: number;
  #userId?: string;
  #category: Category;
  #currency?: Currency;
  #description?: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: BudgetDataInput) {
    const {
      id = uuidv4(),
      name,
      amount,
      userId,
      description,
      category,
      currency = Currency.USD,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#name = name;
    this.#amount = amount;
    this.#userId = userId;
    this.#category = category;
    this.#currency = currency;
    this.#description = description;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  /**
   * Gets the unique identifier of the budget.
   *
   * @returns {string} The unique ID of the budget.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the name of the budget.
   *
   * @returns {string | undefined} The name of the budget, or undefined if not set.
   */
  get name(): string | undefined {
    return this.#name;
  }

  /**
   * Sets the name of the budget.
   *
   * @param value - The name to set for the budget.
   */
  set name(value: string | undefined) {
    this.#name = value;
  }

  /**
   * Gets the amount of the budget.
   *
   * @returns {number} The amount of the budget.
   */
  get amount(): number {
    return this.#amount;
  }

  /**
   * Sets the amount of the budget.
   *
   * @param value - The amount to set for the budget.
   */
  set amount(value: number | undefined) {
    if (!value) {
      return;
    }
    if (value < 0) {
      throw new Error('Budget amount cannot be negative');
    }
    this.#amount = value;
  }

  /**
   * Gets the user ID associated with the budget.
   *
   * @returns {string | undefined} The user ID, or undefined if not set.
   */
  get userId(): string | undefined {
    return this.#userId;
  }

  /**
   * Sets the user ID associated with the budget.
   *
   * @param value - The user ID to set for the budget.
   */
  set userId(value: string | undefined) {
    this.#userId = value;
  }

  /**
   * Gets the description of the budget.
   *
   * @returns {string | undefined} The description of the budget, or undefined if not set.
   */
  get description(): string | undefined {
    return this.#description;
  }

  /**
   * Sets the description of the budget.
   *
   * @param value - The description to set for the budget.
   */
  set description(value: string | undefined) {
    this.#description = value;
  }

  /**
   * Gets the category of the budget.
   *
   * @returns {Category} The category of the budget.
   */
  get category(): Category {
    return this.#category;
  }

  /**
   * Sets the category of the budget.
   *
   * @param value - The category to set for the budget.
   */
  set category(value: Category | undefined) {
    if (!value) {
      return;
    }
    this.#category = value;
  }

  /**
   * Gets the currency of the budget.
   *
   * @returns {Currency} The currency of the budget.
   */
  get currency(): Currency | undefined {
    return this.#currency;
  }

  /**
   * Sets the currency of the budget.
   *
   * @param value - The currency to set for the budget.
   */
  set currency(value: Currency | undefined) {
    if (!value) {
      return;
    }
    this.#currency = value;
  }

  /**
   * Gets the creation date of the budget.
   *
   * @returns {Date} The date when the budget was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * Sets the creation date of the budget.
   *
   * @param value - The date to set for the budget's creation.
   */
  set createdAt(value: Date) {
    this.#createdAt = value;
  }

  /**
   * Gets the last updated date of the budget.
   *
   * @returns {Date} The date when the budget was last updated.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * Sets the last updated date of the budget.
   *
   * @param value - The date to set for the budget's last update.
   */
  set updatedAt(value: Date) {
    this.#updatedAt = value;
  }
}
