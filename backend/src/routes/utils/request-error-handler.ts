import { log } from '../../libs/logger';
import { ApplicationException } from '../../domain/exceptions/application.exception';
import { NextFunction, Response, Request } from 'express';

export const requestErrorHandler = (
  error: Error | ApplicationException,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  log.error({ message: 'Error occurred:', code: '', error });
  if (error instanceof ApplicationException) {
    const { status, error: errorData } = error.toJSON();
    res.status(status);
    res.json(errorData);
    return;
  }

  const errMessage = error?.message ?? 'Internal Server Error';

  res.status(500).json({
    error: {
      message: errMessage,
      data: null,
    },
  });
};
