import { Currency } from '@domain/enum/currency.enum';
import { v4 as uuidv4 } from 'uuid';

interface UserDataInput {
  id?: string;
  name?: string;
  email: string;
  currency?: Currency;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  readonly #id: string;
  #name?: string;
  #email: string;
  #currency?: Currency;
  #password: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: UserDataInput) {
    const {
      id = uuidv4(),
      name,
      email,
      password,
      currency,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#currency = currency;
    this.#password = password;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  /**
   * Gets the unique identifier of the user.
   *
   * @returns {string} The unique ID of the user.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the name of the user.
   *
   * @returns The name of the user as a string, or `undefined` if the name is not set.
   */
  get name(): string | undefined {
    return this.#name;
  }

  /**
   * Sets the name of the user.
   *
   * @param value - The name to set for the user. Can be a string or undefined.
   */
  set name(value: string | undefined) {
    this.#name = value;
  }

  /**
   * Gets the email address of the user.
   *
   * @returns The email address as a string.
   */
  get email(): string {
    return this.#email;
  }

  /**
   * Sets the email address for the user.
   *
   * @param value - The email address to be assigned to the user.
   */
  set email(value: string) {
    this.#email = value;
  }

  /**
   * Gets the user's preferred currency.
   *
   * @returns The user's preferred currency as a `Currency` enum value, or `undefined` if not set.
   */
  get currency(): Currency | undefined {
    return this.#currency;
  }

  /**
   * Sets the user's preferred currency.
   *
   * @param value - The currency to be set for the user, as a `Currency` enum value.
   */
  set currency(value: Currency | undefined) {
    this.#currency = value;
  }

  /**
   * Getter for the user's password.
   *
   * @remarks
   * This method retrieves the user's password.
   * Ensure that the password is handled securely and not exposed in logs or UI.
   *
   * @returns The user's password as a string.
   */
  get password(): string {
    return this.#password;
  }

  /**
   * Sets the user's password.
   * @param value - The new password to be set for the user.
   *
   * Note: Ensure the password is securely hashed before storing it.
   */
  set password(value: string) {
    this.#password = value;
  }

  /**
   * Gets the creation date of the user.
   *
   * @returns {Date} The date and time when the user was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * Gets the date and time when the user was last updated.
   *
   * @returns {Date} The timestamp of the last update.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }
}
