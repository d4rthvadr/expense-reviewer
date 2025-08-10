import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { v4 as uuidv4 } from 'uuid';

export interface ExpenseItem {
  id?: string;
  name: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  userId?: string;
  qty?: number;
}

interface ExpenseDataInput {
  id?: string;
  name?: string;
  type: string;
  userId?: string;
  status: ExpenseStatus;
  review?: string;
  currency?: Currency;
  items: ExpenseItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExpenseModel {
  readonly #id: string;
  #name?: string;
  #type: string;
  #status: ExpenseStatus;
  #review?: string;
  #items: ExpenseItem[];
  #userId?: string;
  #currency?: Currency;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: ExpenseDataInput) {
    const {
      id = uuidv4(),
      name,
      type,
      items,
      userId,
      status = ExpenseStatus.PENDING,
      review,
      currency = Currency.USD,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#name = name;
    this.#type = type;
    this.#items = items;
    this.#review = review;
    this.#status = status;
    this.#currency = currency;
    this.#userId = userId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  /**
   * Gets the unique identifier of the expense.
   *
   * @returns {string} The unique ID of the expense.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the name of the expense.
   *
   * @returns {string | undefined} The name of the expense, or `undefined` if not set.
   */
  get name(): string | undefined {
    return this.#name;
  }

  /**
   * Sets the name of the expense.
   *
   * @param value - The name to set, which can be a string or undefined.
   */
  set name(value: string | undefined) {
    this.#name = value;
  }
  /**
   * Gets the type of the expense.
   *
   * @returns {string} The type of the expense.
   */
  get type(): string {
    return this.#type;
  }
  /**
   * Sets the type of the expense.
   *
   * @param value - The type of the expense as a string.
   */
  set type(value: string) {
    this.#type = value;
  }
  /**
   * Retrieves the list of expense items associated with this expense.
   *
   * @returns {ExpenseItem[]} An array of `ExpenseItem` objects.
   */
  get items(): ExpenseItem[] {
    return this.#items;
  }
  /**
   * Sets the list of expense items.
   *
   * @param value - An array of `ExpenseItem` objects to be assigned to the expense.
   */
  set items(value: ExpenseItem[]) {
    this.#items = value;
  }

  /**
   * Gets the user ID associated with the expense.
   *
   * @returns {string | undefined} The unique identifier of the user, or `undefined` if not set.
   */
  get userId(): string | undefined {
    return this.#userId;
  }

  /**
   * Sets the user ID associated with the expense.
   *
   * @param value - The unique identifier of the user.
   */
  set userId(value: string) {
    this.#userId = value;
  }

  /**
   * Gets the currency of the expense.
   *
   * @returns {Currency} The currency used for the expense.
   */
  get currency(): Currency | undefined {
    return this.#currency;
  }

  /**
   * Sets the currency of the expense.
   *
   * @param value - The currency to set for the expense.
   */
  set currency(value: Currency | undefined) {
    if (!value) {
      return;
    }
    this.#currency = value;
  }

  /**
   * Gets the status of the expense.
   *
   * @returns {ExpenseStatus} The current status of the expense.
   */
  get status(): ExpenseStatus {
    return this.#status;
  }

  /**
   * Sets the status of the expense.
   *
   * @param value - The status to set for the expense, as an `ExpenseStatus` enum value.
   */
  set status(value: ExpenseStatus) {
    if (!value) {
      return;
    }
    this.#status = value;
  }

  /**
   * Gets the review or notes associated with the expense.
   *
   * @returns {string | undefined} The review text, or `undefined` if not set.
   */
  get review(): string | undefined {
    return this.#review;
  }

  /**
   * Sets the review or notes for the expense.
   *
   * @param value - The review text to set, which can be a string or undefined.
   */
  set review(value: string | undefined) {
    this.#review = value;
  }

  /**
   * Gets the creation date of the expense.
   *
   * @returns {Date} The date and time when the expense was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  set createdAt(value: Date) {
    if (!value) {
      return;
    }
    this.#createdAt = value;
    this.#updatedAt = new Date(); // Update the updatedAt timestamp whenever createdAt is set
  }

  /**
   * Gets the date and time when the expense was last updated.
   *
   * @returns {Date} The timestamp of the last update.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }
}
