import { normalizeError } from '@domain/exceptions/utils/normalize-error';
import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array().pop();

    if (error) {
      const { status, error: err } = normalizeError({
        message: error.msg,
        status: 400,
      });
      res.status(status).send(err);
      return;
    }
  }

  next();
};
