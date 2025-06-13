import { type Request, type Response } from 'express';
/**
 * A utility function to handle asynchronous route handlers and middleware.
 * This function wraps an asynchronous function and ensures that any errors
 * thrown within the function are passed to the next middleware for error handling.
 *
 * @param fn - The asynchronous function to be wrapped. It should accept
 * `req`, `res`, and `next` as parameters.
 * @returns A function that takes `req`, `res`, and `next` as arguments,
 * executes the wrapped function, and catches any errors to pass them to `next`.
 *
 * @example
 * ```typescript
 * import { asyncHandler } from './utils/async-handler';
 *
 * router.get('/example', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 * ```
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
