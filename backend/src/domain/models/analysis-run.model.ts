import { AnalysisRunStatus } from '../../../generated/prisma';
import { v4 as uuidv4 } from 'uuid';

interface AnalysisRunDataInput {
  id?: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  status?: AnalysisRunStatus;
  attemptCount?: number;
  lastError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AnalysisRunModel {
  readonly #id: string;
  #userId: string;
  #periodStart: Date;
  #periodEnd: Date;
  #status: AnalysisRunStatus;
  #attemptCount: number;
  #lastError?: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: AnalysisRunDataInput) {
    const {
      id = uuidv4(),
      userId,
      periodStart,
      periodEnd,
      status = AnalysisRunStatus.PENDING,
      attemptCount = 0,
      lastError,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    this.#id = id;
    this.#userId = userId;
    this.#periodStart = periodStart;
    this.#periodEnd = periodEnd;
    this.#status = status;
    this.#attemptCount = attemptCount;
    this.#lastError = lastError;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  // Getters
  get id(): string {
    return this.#id;
  }

  get userId(): string {
    return this.#userId;
  }

  get periodStart(): Date {
    return this.#periodStart;
  }

  get periodEnd(): Date {
    return this.#periodEnd;
  }

  get status(): AnalysisRunStatus {
    return this.#status;
  }

  get attemptCount(): number {
    return this.#attemptCount;
  }

  get lastError(): string | undefined {
    return this.#lastError;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  // Business logic methods
  canBeProcessed(): boolean {
    return (
      this.#status === AnalysisRunStatus.PENDING ||
      this.#status === AnalysisRunStatus.FAILED
    );
  }

  isProcessing(): boolean {
    return this.#status === AnalysisRunStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.#status === AnalysisRunStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.#status === AnalysisRunStatus.FAILED;
  }

  markAsProcessing(): void {
    if (this.#status === AnalysisRunStatus.COMPLETED) {
      throw new Error(
        'Cannot reprocess a completed analysis run. Completed runs are terminal.'
      );
    }
    if (this.#status === AnalysisRunStatus.PROCESSING) {
      throw new Error(
        'Analysis run is already processing. Cannot mark as processing again.'
      );
    }
    // Valid transitions: PENDING → PROCESSING, FAILED → PROCESSING (retry)
    this.#status = AnalysisRunStatus.PROCESSING;
    this.#attemptCount += 1;
    this.#updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this.#status !== AnalysisRunStatus.PROCESSING) {
      throw new Error(
        `Cannot mark analysis run as completed from status: ${this.#status}. Only PROCESSING runs can be completed.`
      );
    }
    this.#status = AnalysisRunStatus.COMPLETED;
    this.#updatedAt = new Date();
  }

  markAsFailed(error: string): void {
    if (this.#status !== AnalysisRunStatus.PROCESSING) {
      throw new Error(
        `Cannot mark analysis run as failed from status: ${this.#status}. Only PROCESSING runs can be marked as failed.`
      );
    }
    this.#status = AnalysisRunStatus.FAILED;
    this.#lastError = error;
    this.#updatedAt = new Date();
  }
}
