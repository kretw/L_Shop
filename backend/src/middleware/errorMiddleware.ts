import { Request, Response, NextFunction } from 'express';

export interface IAppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: IAppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  console.error(`[ERROR] ${status}: ${message}`);

  res.status(status).json({
    error: message,
  });
}