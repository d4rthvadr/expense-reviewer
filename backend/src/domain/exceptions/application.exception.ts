import { ErrorResponse, normalizeError } from './utils/normalize-error';

export class ApplicationException extends Error {
  status: number;
  /**
   * Constructor for ApplicationException.
   * @param message - The error message.
   * @param status - The HTTP status code.
   */
  constructor(message: string = 'Internal Server Error', status: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }

  /**
   * Converts the error to a JSON object.
   * @returns The error as a JSON object.
   */
  toJSON(): ErrorResponse {
    return normalizeError({ message: this.message, status: this.status });
  }
}
