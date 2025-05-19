import { logger as winstonLogger } from './logger';

type IError = unknown | Error;

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

const truncateMessage = (str: string, maxLength: number = 200): string => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

const logData = (
  payload:
    | string
    | LoggerLevels['info']
    | LoggerLevels['warn']
    | LoggerLevels['error'],
  logLevel: keyof LoggerLevels
) => {
  if (typeof payload === 'string') {
    return {
      message: truncateMessage(payload),
    };
  } else if (typeof payload === 'object') {
    const { message, ...rest } = payload;
    return { message: truncateMessage(message), ...rest };
  }
  winstonLogger[logLevel](payload);
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
