import { Request } from 'express';
export type RequestQueryType<T> = Request<unknown, T, unknown>;
