import { v4 as uuidv4 } from 'uuid';
import { Category } from './enum/category.enum';

export interface ExpenseItem {
  id?: string;
  name: string;
  description?: string;
  category: Category;
  amount: number;
  userId?: string;
  qty?: number;
}

interface ExpenseDataInput {
  id?: string;
  name?: string;
  type: string;
  userId?: string;
  items: ExpenseItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExpenseModel {
  readonly #id: string;
  #name?: string;
  #type: string;
  #items: ExpenseItem[];
  #userId?: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: ExpenseDataInput) {
    const {
      id = uuidv4(),
      name,
      type,
      items,
      userId,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#name = name;
    this.#type = type;
    this.#items = items;
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
   * Gets the creation date of the expense.
   *
   * @returns {Date} The date and time when the expense was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
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
