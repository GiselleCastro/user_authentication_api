import { Logger } from "../config/Logger";
import { UnprocessableEntityError } from "./errors";

export const handlerErrorDB = (
  message: string,
  error: unknown,
  logger: Logger,
  context?: object,
) => {
  logger.error(message, error, context);
  throw new UnprocessableEntityError(message);
};
