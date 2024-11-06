import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ParameterType } from "../enum/index";
import { BadRequestError } from "../utils/errors";
import { BaseEntity } from "../config/BaseEntity";
import { ERROR_VALIDATION, INTERNAL_SERVER_ERROR } from "../utils/messages";
import httpStatusCode from "http-status-codes";

export class ValidateSchemaMiddleware extends BaseEntity {
  handle(schema: z.AnyZodObject, parameterType: ParameterType) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await schema.parseAsync(request[parameterType]);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorZod = error.issues.map((e) => e.message);
          const { code, ...infoError } = new BadRequestError(
            ERROR_VALIDATION,
            errorZod,
          );
          return reply.status(code).send(infoError);
        }

        this.logger.error(INTERNAL_SERVER_ERROR, error);

        return reply
          .status(httpStatusCode.INTERNAL_SERVER_ERROR)
          .send({ error: INTERNAL_SERVER_ERROR });
      }
    };
  }
}
