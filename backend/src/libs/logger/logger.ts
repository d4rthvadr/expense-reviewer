import winston from 'winston';
const { combine, colorize, timestamp, printf, json, errors } = winston.format;

const mode = process.env.NODE_ENV || 'prod';
const level = mode === 'prod' ? 'info' : 'debug';
const timestampFormat = 'YYYY-MM-DD HH:mm:ss A';

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
];

if (mode === 'prod') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: json(),
    })
  );
}

const getLogFormat = () => {
  return combine(
    colorize({ all: true }),
    timestamp({
      format: timestampFormat,
    }),
    printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message} `
    ),
    errors({ stack: true })
  );
};

const logger = winston.createLogger({
  level,
  format: getLogFormat(),
  exceptionHandlers: transports,
  transports,
});

logger.debug('Logger initialized', { mode, env: process.env.NODE_ENV, level });

export { logger };
