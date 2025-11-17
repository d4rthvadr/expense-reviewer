import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';
import { v4 as uuidv4 } from 'uuid';

interface NotificationDataInput {
  id?: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  resourceType: NotificationResourceType;
  resourceId: string;
  title: string;
  message: string;
  meta?: Record<string, unknown> | null;
  isRead?: boolean;
  dedupeKey?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NotificationModel {
  readonly #id: string;
  readonly #userId: string;
  readonly #type: NotificationType;
  readonly #severity: NotificationSeverity;
  readonly #resourceType: NotificationResourceType;
  readonly #resourceId: string;
  #title: string;
  #message: string;
  #meta?: Record<string, unknown> | null;
  #isRead: boolean;
  readonly #dedupeKey?: string | null;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: NotificationDataInput) {
    const {
      id = uuidv4(),
      userId,
      type,
      severity,
      resourceType,
      resourceId,
      title,
      message,
      meta = null,
      isRead = false,
      dedupeKey = null,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    this.#id = id;
    this.#userId = userId;
    this.#type = type;
    this.#severity = severity;
    this.#resourceType = resourceType;
    this.#resourceId = resourceId;
    this.#title = this.#validateTitle(title);
    this.#message = this.#validateMessage(message);
    this.#meta = meta;
    this.#isRead = isRead;
    this.#dedupeKey = dedupeKey;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id(): string {
    return this.#id;
  }

  get userId(): string {
    return this.#userId;
  }

  get type(): NotificationType {
    return this.#type;
  }

  get severity(): NotificationSeverity {
    return this.#severity;
  }

  get resourceType(): NotificationResourceType {
    return this.#resourceType;
  }

  get resourceId(): string {
    return this.#resourceId;
  }

  get title(): string {
    return this.#title;
  }

  set title(value: string) {
    this.#title = this.#validateTitle(value);
    this.#updatedAt = new Date();
  }

  get message(): string {
    return this.#message;
  }

  set message(value: string) {
    this.#message = this.#validateMessage(value);
    this.#updatedAt = new Date();
  }

  get meta(): Record<string, unknown> | null | undefined {
    return this.#meta;
  }

  set meta(value: Record<string, unknown> | null | undefined) {
    this.#meta = value;
    this.#updatedAt = new Date();
  }

  get isRead(): boolean {
    return this.#isRead;
  }

  get dedupeKey(): string | null | undefined {
    return this.#dedupeKey;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  markAsRead(): void {
    if (!this.#isRead) {
      this.#isRead = true;
      this.#updatedAt = new Date();
    }
  }

  markAsUnread(): void {
    if (this.#isRead) {
      this.#isRead = false;
      this.#updatedAt = new Date();
    }
  }

  static createDedupeKey(
    type: NotificationType,
    severity: NotificationSeverity,
    resourceType: NotificationResourceType,
    resourceId: string,
    period?: string
  ): string {
    const parts = [type, severity, resourceType, resourceId];
    if (period) {
      parts.push(period);
    }
    return parts.join(':');
  }

  #validateTitle(title: string): string {
    if (!title || title.trim().length === 0) {
      throw new Error('Notification title cannot be empty');
    }
    if (title.length > 255) {
      throw new Error('Notification title cannot exceed 255 characters');
    }
    return title.trim();
  }

  #validateMessage(message: string): string {
    if (!message || message.trim().length === 0) {
      throw new Error('Notification message cannot be empty');
    }
    return message.trim();
  }
}
