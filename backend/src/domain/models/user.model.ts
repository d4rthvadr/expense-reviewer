import { Currency } from '@domain/enum/currency.enum';
import { UserStatus } from '@domain/enum/user-status.enum';
import { v4 as uuidv4 } from 'uuid';

interface UserDataInput {
  id?: string;
  name?: string;
  status?: UserStatus;
  email: string;
  currency?: Currency;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  lastRecurSync?: Date;
}

export class UserModel {
  #id: string;
  #name?: string;
  #email: string;
  #status?: UserStatus;
  #currency?: Currency;
  #password: string;
  #createdAt: Date;
  #updatedAt: Date;
  #lastLogin?: Date;
  #lastRecurSync?: Date;

  constructor(data: UserDataInput) {
    const {
      id = uuidv4(),
      name,
      email,
      password,
      status = UserStatus.PENDING,
      currency,
      createdAt = new Date(),
      updatedAt = new Date(),
      lastLogin,
      lastRecurSync,
    } = data;
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#status = status;
    this.#currency = currency;
    this.#password = password;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    this.#lastLogin = lastLogin;
    this.#lastRecurSync = lastRecurSync;
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
   * Sets the unique identifier for the user.
   *
   * @param value - The unique ID to be assigned to the user.
   */
  set id(value: string) {
    this.#id = value;
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
   * Gets the status of the user.
   *
   * @returns {string} The current status of the user.
   */
  get status(): UserStatus | undefined {
    if (this.#status) {
      return this.#status;
    }
  }

  /**
   * Sets the status of the user.
   *
   * @param value - The new status to be set for the user.
   */
  set status(value: UserStatus | undefined) {
    if (value) {
      this.#status = value;
    }
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

  /**
   * Gets the date and time when the user's recurring sync was last performed.
   *
   * @returns {Date | undefined} The timestamp of the last recurring sync, or undefined if never synced.
   */
  get lastRecurSync(): Date | undefined {
    return this.#lastRecurSync;
  }

  /**
   * Sets the date and time when the user's recurring sync was last performed.
   *
   * @param value - The new timestamp for the last recurring sync.
   */
  set lastRecurSync(value: Date | undefined) {
    this.#lastRecurSync = value;
  }

  /**
   * Gets the date and time when the user last logged in.
   *
   * @returns {Date | undefined} The timestamp of the last login, or undefined if never logged in.
   */
  get lastLogin(): Date | undefined {
    return this.#lastLogin;
  }

  /**
   * Sets the date and time when the user last logged in.
   *
   * @param value - The new timestamp for the last login.
   */
  set lastLogin(value: Date | undefined) {
    this.#lastLogin = value;
  }
}
