import winston from 'winston';
const { combine, colorize, timestamp, json, errors, prettyPrint } =
  winston.format;

const mode = process.env.NODE_ENV || 'prod';
const level = mode === 'prod' ? 'info' : 'debug';
const timestampFormat = 'YYYY-MM-DD HH:mm:ss A';

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: json(),
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
    prettyPrint(),
    errors({ stack: true })
  );
};

const logger = winston.createLogger({
  level,
  format: getLogFormat(),
  exceptionHandlers: transports,
  transports,
});

export { logger };
