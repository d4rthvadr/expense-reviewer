import { logger as winstonLogger } from './logger';

type IError = unknown | Error;

const MAX_LOG_MESSAGE_LENGTH = 200;

type LoggerLevels = {
  info: {
    message: string;
  };
  error: {
    code: string;
    message: string;
    error: IError;
  };
  warn: {
    code: string;
    message: string;
    error?: IError;
  };
};

/**
 * Truncates a given string to a specified maximum length and appends an ellipsis ("...")
 * if the string exceeds the maximum length.
 *
 * @param str - The input string to be truncated.
 * @param maxLength - The maximum allowed length of the string. Defaults to `MAX_LOG_MESSAGE_LENGTH`.
 * @returns The truncated string with an ellipsis if it exceeds the maximum length,
 *          or the original string if it is within the limit.
 */
const truncateMessage = (
  str: string,
  maxLength: number = MAX_LOG_MESSAGE_LENGTH
): string => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

type LogDataType =
  | string
  | LoggerLevels['info']
  | LoggerLevels['warn']
  | LoggerLevels['error'];

/**
 * Creates a log data object by processing the input log data.
 *
 * - If the input is a string, it returns an object with the truncated message.
 * - If the input is an object, it extracts the `message` property, truncates it,
 *   and includes the rest of the properties in the returned object.
 *
 * @param logData - The log data to process. It can be a string or an object.
 * @returns An object containing the processed log data with a truncated message.
 */
const createLogData = (logData: LogDataType) => {
  if (typeof logData === 'string') {
    return {
      message: truncateMessage(logData),
    };
  } else if (typeof logData === 'object') {
    const { message, ...rest } = logData;
    return { message: truncateMessage(message), ...rest };
  }
};
/**
 * Logs data using the specified log level.
 *
 * @param payload - The data to be logged, adhering to the `LogDataType` structure.
 * @param logLevel - The logging level to use (e.g., 'info', 'error', 'warn'), which must be a key of `LoggerLevels`.
 */
const logData = (payload: LogDataType, logLevel: keyof LoggerLevels) => {
  winstonLogger[logLevel](createLogData(payload));
};

class Logger {
  info(payload: string | LoggerLevels['info']): void {
    logData(payload, 'info');
  }
  error(payload: string | LoggerLevels['error']): void {
    logData(payload, 'error');
  }

  warn(payload: string | LoggerLevels['warn']): void {
    logData(payload, 'warn');
  }
}

export const log = new Logger();
