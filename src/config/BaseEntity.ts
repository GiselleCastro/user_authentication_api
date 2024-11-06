import { Logger } from "./Logger";
import { HandlerError } from "./HandlerError";
import { BaseError } from "./BaseError";
import { INTERNAL_SERVER_ERROR } from "../utils/messages";
import type { FastifyReply } from "fastify";

import HttpStatusCode from "http-status-codes";
export abstract class BaseEntity {
  protected readonly logger: Logger;
  protected readonly handlerError: HandlerError;

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.handlerError = new HandlerError();
  }

  handlerErrorController(
    error: unknown,
    reply: FastifyReply,
    context?: object,
  ) {
    if (error instanceof BaseError) {
      const { code, ...details } = error;
      return reply.code(code).send(details);
    }

    this.logger.error(INTERNAL_SERVER_ERROR, error, context);

    return reply
      .code(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .send({ message: INTERNAL_SERVER_ERROR });
  }
}
