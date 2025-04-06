export class AppError extends Error {
  public status: string;
  public isOperational: boolean;
  public errors?: any[];

  constructor(message: string, public statusCode: number, errors?: any[]) {
    super(message);

    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
} 