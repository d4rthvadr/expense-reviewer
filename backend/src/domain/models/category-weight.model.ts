import { Category } from '@domain/enum/category.enum';
import { v4 as uuidv4 } from 'uuid';

interface DefaultCategoryWeightDataInput {
  id?: string;
  category: Category;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DefaultCategoryWeightModel {
  readonly #id: string;
  readonly #category: Category;
  #weight: number;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: DefaultCategoryWeightDataInput) {
    const {
      id = uuidv4(),
      category,
      weight,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#category = category;
    this.#weight = weight;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  /**
   * Gets the unique identifier of the default category weight.
   *
   * @returns {string} The unique ID.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the category.
   *
   * @returns {Category} The expense category.
   */
  get category(): Category {
    return this.#category;
  }

  /**
   * Gets the weight value.
   *
   * @returns {number} The weight as a decimal (0.0 to 1.0).
   */
  get weight(): number {
    return this.#weight;
  }

  /**
   * Sets the weight value.
   *
   * @param value - The weight to set (must be between 0 and 1).
   */
  set weight(value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Weight must be between 0 and 1 (inclusive)');
    }
    this.#weight = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the creation date.
   *
   * @returns {Date} The date when the weight was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * Sets the creation date.
   *
   * @param value - The date to set for creation.
   */
  set createdAt(value: Date) {
    this.#createdAt = value;
  }

  /**
   * Gets the last updated date.
   *
   * @returns {Date} The date when the weight was last updated.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * Sets the last updated date.
   *
   * @param value - The date to set for last update.
   */
  set updatedAt(value: Date) {
    this.#updatedAt = value;
  }
}

interface UserCategoryWeightDataInput {
  id?: string;
  userId: string;
  category: Category;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserCategoryWeightModel {
  readonly #id: string;
  readonly #userId: string;
  readonly #category: Category;
  #weight: number;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: UserCategoryWeightDataInput) {
    const {
      id = uuidv4(),
      userId,
      category,
      weight,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#userId = userId;
    this.#category = category;
    this.#weight = weight;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  /**
   * Gets the unique identifier of the user category weight.
   *
   * @returns {string} The unique ID.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the user ID.
   *
   * @returns {string} The ID of the user who owns this weight preference.
   */
  get userId(): string {
    return this.#userId;
  }

  /**
   * Gets the category.
   *
   * @returns {Category} The expense category.
   */
  get category(): Category {
    return this.#category;
  }

  /**
   * Gets the weight value.
   *
   * @returns {number} The weight as a decimal (0.0 to 1.0).
   */
  get weight(): number {
    return this.#weight;
  }

  /**
   * Sets the weight value.
   *
   * @param value - The weight to set (must be between 0 and 1).
   */
  set weight(value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Weight must be between 0 and 1 (inclusive)');
    }
    this.#weight = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the creation date.
   *
   * @returns {Date} The date when the weight was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * Sets the creation date.
   *
   * @param value - The date to set for creation.
   */
  set createdAt(value: Date) {
    this.#createdAt = value;
  }

  /**
   * Gets the last updated date.
   *
   * @returns {Date} The date when the weight was last updated.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * Sets the last updated date.
   *
   * @param value - The date to set for last update.
   */
  set updatedAt(value: Date) {
    this.#updatedAt = value;
  }
}
