import { Request } from 'express';
export type RequestBodyType<T> = Request<unknown, unknown, T>;
