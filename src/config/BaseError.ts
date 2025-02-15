import HttpStatusCode, { StatusCodes } from 'http-status-codes';

export abstract class BaseError {
  code: StatusCodes = HttpStatusCode.BAD_REQUEST;
  constructor(
    public message: string,
    public details?: string[],
  ) {}
}

export class BadRequestError extends BaseError {
  code: StatusCodes = HttpStatusCode.BAD_REQUEST;
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}

export class NotFoundError extends BaseError {
  code: StatusCodes = HttpStatusCode.NOT_FOUND;
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}

export class UnauthorizedError extends BaseError {
  code: StatusCodes = HttpStatusCode.UNAUTHORIZED;
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}

export class ForbiddenError extends BaseError {
  code: StatusCodes = HttpStatusCode.FORBIDDEN;
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}

export class UnprocessableEntityError extends BaseError {
  code: StatusCodes = HttpStatusCode.UNPROCESSABLE_ENTITY;
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}
