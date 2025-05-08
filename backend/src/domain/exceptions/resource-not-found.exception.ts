import { ApplicationException } from './application.exception';

export class ResourceNotFoundException extends ApplicationException {
  status: number = 404;
  /**
   * Constructor for ResourceNotFoundException.
   * @param message - The error message.
   */
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = this.constructor.name;
  }
}
