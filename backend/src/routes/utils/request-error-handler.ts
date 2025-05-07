import { NextFunction, Response, Request } from 'express';

export const requestErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error occurred:', error);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      data: null,
    },
  });
};
