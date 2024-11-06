import type { FastifyReply } from "fastify";
import type { Logger } from "../config/Logger";
import { BaseError } from "./errors";
import { INTERNAL_SERVER_ERROR } from "./messages";
import HttpStatusCode from "http-status-codes";

export const handlerErrorRequest = (
  error: unknown,
  logger: Logger,
  reply: FastifyReply,
  context?: object,
) => {
  if (error instanceof BaseError) {
    const { code, ...details } = error;
    return reply.code(code).send(details);
  }

  logger.error(INTERNAL_SERVER_ERROR, error, context);

  return reply
    .code(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .send({ message: INTERNAL_SERVER_ERROR });
};
