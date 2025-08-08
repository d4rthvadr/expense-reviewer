import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { RecurringPeriod } from '@domain/enum/recurring-period.enum';
import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';
import { log } from '@infra/logger';
import { v4 as uuidv4 } from 'uuid';

interface RecurringTemplateDataInput {
  id?: string;
  name?: string;
  userId?: string;
  type: RecurringTemplateType;
  amount: number;
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  currency?: Currency;
  category: Category;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RecurringTemplateModel {
  readonly #id: string;
  #name?: string;
  #userId?: string;
  #type: RecurringTemplateType;
  #amount: number;
  #isRecurring: boolean;
  #recurringPeriod?: RecurringPeriod;
  #startDate: Date;
  #endDate?: Date;
  #isActive: boolean;
  #currency?: Currency;
  #category: Category;
  #description?: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: RecurringTemplateDataInput) {
    const {
      id = uuidv4(),
      name,
      userId,
      type,
      amount,
      isRecurring = true,
      recurringPeriod,
      startDate,
      endDate,
      isActive = true,
      currency = Currency.USD,
      category,
      description,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    // Validation for recurring fields
    this.validateRecurringFields(isRecurring, recurringPeriod);

    // Validation for date range
    const finalStartDate = startDate ?? createdAt;
    this.validateDateRange(finalStartDate, endDate);

    this.#id = id;
    this.#name = name;
    this.#userId = userId;
    this.#type = type;
    this.#amount = amount;
    this.#isRecurring = isRecurring;
    this.#recurringPeriod = recurringPeriod;
    this.#startDate = finalStartDate;
    this.#endDate = endDate;
    this.#isActive = isActive;
    this.#currency = currency;
    this.#category = category;
    this.#description = description;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  private validateRecurringFields(
    isRecurring: boolean,
    recurringPeriod?: RecurringPeriod
  ): void {
    if (isRecurring && !recurringPeriod) {
      log.warn('Recurring period is required for recurring templates');
      // TODO: Consider throwing an error here if strict validation is needed
    }
    if (!isRecurring && recurringPeriod) {
      log.warn(
        'Recurring period should not be set for non-recurring templates'
      );
      // TODO: Consider throwing an error here if strict validation is needed
    }
  }

  private validateDateRange(startDate: Date, endDate?: Date): void {
    if (endDate && startDate && endDate < startDate) {
      throw new Error('End date must not be before start date');
    }
  }

  /**
   * Gets the unique identifier of the recurring template.
   */
  get id(): string {
    return this.#id;
  }

  /**
   * Gets the name of the recurring template.
   */
  get name(): string | undefined {
    return this.#name;
  }

  /**
   * Sets the name of the recurring template.
   */
  set name(value: string | undefined) {
    this.#name = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the user ID associated with the recurring template.
   */
  get userId(): string | undefined {
    return this.#userId;
  }

  /**
   * Sets the user ID associated with the recurring template.
   */
  set userId(value: string | undefined) {
    this.#userId = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the type of the recurring template.
   */
  get type(): RecurringTemplateType {
    return this.#type;
  }

  /**
   * Sets the type of the recurring template.
   */
  set type(value: RecurringTemplateType) {
    this.#type = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the amount of the recurring template.
   */
  get amount(): number {
    return this.#amount;
  }

  /**
   * Sets the amount of the recurring template.
   */
  set amount(value: number) {
    if (value <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    this.#amount = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets whether the template is recurring.
   */
  get isRecurring(): boolean {
    return this.#isRecurring;
  }

  /**
   * Sets whether the template is recurring.
   */
  set isRecurring(value: boolean) {
    this.#isRecurring = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the recurring period.
   */
  get recurringPeriod(): RecurringPeriod | undefined {
    return this.#recurringPeriod;
  }

  /**
   * Sets the recurring period.
   */
  set recurringPeriod(value: RecurringPeriod | undefined) {
    this.validateRecurringFields(this.#isRecurring, value);
    this.#recurringPeriod = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the start date of the recurring template.
   */
  get startDate(): Date {
    return this.#startDate;
  }

  /**
   * Sets the start date of the recurring template.
   */
  set startDate(value: Date) {
    this.validateDateRange(value, this.#endDate);
    this.#startDate = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the end date of the recurring template.
   */
  get endDate(): Date | undefined {
    return this.#endDate;
  }

  /**
   * Sets the end date of the recurring template.
   */
  set endDate(value: Date | undefined) {
    this.validateDateRange(this.#startDate, value);
    this.#endDate = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets whether the template is active.
   */
  get isActive(): boolean {
    return this.#isActive;
  }

  /**
   * Sets whether the template is active.
   */
  set isActive(value: boolean) {
    this.#isActive = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the currency of the recurring template.
   */
  get currency(): Currency | undefined {
    return this.#currency;
  }

  /**
   * Sets the currency of the recurring template.
   */
  set currency(value: Currency | undefined) {
    this.#currency = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the category of the recurring template.
   */
  get category(): Category {
    return this.#category;
  }

  /**
   * Sets the category of the recurring template.
   */
  set category(value: Category) {
    this.#category = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the description of the recurring template.
   */
  get description(): string | undefined {
    return this.#description;
  }

  /**
   * Sets the description of the recurring template.
   */
  set description(value: string | undefined) {
    this.#description = value;
    this.#updatedAt = new Date();
  }

  /**
   * Gets the creation date of the recurring template.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * Gets the last updated date of the recurring template.
   */
  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * Manually update the updatedAt timestamp.
   */
  touch(): void {
    this.#updatedAt = new Date();
  }
}
