import { logger as winstonLogger } from './logger';

/**
 * Parses a message and converts it to a string.
 *
 * @param message - The message to be parsed, which can be a string or an object.
 * @returns The parsed message as a string. If the input is an object, it is converted to a JSON string.
 */
const parseMessage = (message: string | object): string => {
  if (typeof message === 'object') {
    return JSON.stringify(message);
  }
  return message;
};

class Logger {
  info(message: string | object, ...meta: unknown[]): void {
    winstonLogger.info(parseMessage(message), meta);
  }
  error(message: string, ...meta: unknown[]): void {
    winstonLogger.error(parseMessage(message), meta);
  }

  warn(message: string, ...meta: unknown[]): void {
    winstonLogger.warn(parseMessage(message), meta);
  }
}

export const log = new Logger();
