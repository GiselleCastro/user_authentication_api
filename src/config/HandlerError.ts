import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  UnprocessableEntityError,
} from "./BaseError";

export class HandlerError {
  badRequestError(message: string, details?: string[]) {
    throw new BadRequestError(message, details);
  }

  notFoundError(message: string, details?: string[]) {
    throw new NotFoundError(message, details);
  }

  unauthorizedError(message: string, details?: string[]) {
    throw new UnauthorizedError(message, details);
  }

  forbiddenError(message: string, details?: string[]) {
    throw new ForbiddenError(message, details);
  }

  unprocessableEntityError(message: string, details?: string[]) {
    throw new UnprocessableEntityError(message, details);
  }
}
