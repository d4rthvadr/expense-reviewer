/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationException } from '@domain/exceptions/application.exception';
import { NextFunction, Response, Request } from 'express';
import { normalizeError } from '@domain/exceptions/utils/normalize-error';

export const requestErrorHandler = (
  error: Error | ApplicationException,
  _req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  _next: NextFunction
) => {
  if (error instanceof ApplicationException) {
    const { status, error: errorData } = error.toJSON();
    res.status(status);
    res.json(errorData);
    return;
  }

  const errMessage = error?.message ?? 'Internal Server Error';

  res.status(500).json(normalizeError({ message: errMessage }).error);
};
