import { log } from '../../libs/logger';
import { ApplicationException } from '../../domain/exceptions/application.exception';
import { NextFunction, Response, Request } from 'express';

export const requestErrorHandler = (
  error: Error | ApplicationException,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  log.error('Error occurred:', error);
  if (error instanceof ApplicationException) {
    const { status, error: errorData } = error.toJSON();
    res.status(status);
    res.json(errorData);
    return;
  }

  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      data: null,
    },
  });
};
