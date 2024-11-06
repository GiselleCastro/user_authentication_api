import type { FastifyRequest, FastifyReply } from "fastify";
import { constants } from "../config/constants";
import { BadRequestError, BaseError } from "../config/BaseError";
import { isTokenJSON, TokenJSON, Access } from "../@types";
import { NO_TOKEN_ACCESS, INTERNAL_SERVER_ERROR } from "../utils/messages";
import { validationToken } from "../utils/validationToken";
import HttpStatusCode from "http-status-codes";

const { SECRET_TOKEN_ACCESS } = constants;

export class CheckAutheticationMiddleware {
  async handle(request: FastifyRequest & Access, reply: FastifyReply) {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      const { code, ...infoError } = new BadRequestError(NO_TOKEN_ACCESS);
      return reply.status(code).send(infoError);
    }

    try {
      const authorization = await validationToken(token, SECRET_TOKEN_ACCESS);

      if (isTokenJSON(authorization)) {
        const access =
          (authorization as TokenJSON).app_metadata.authorization || {};
        access.userId = (authorization as TokenJSON).id;
        request.access = access;
      }
    } catch (error) {
      if (error instanceof BaseError) {
        const { code, ...infoError } = error;
        return reply.status(code).send(infoError);
      }

      return reply
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send({ message: INTERNAL_SERVER_ERROR });
    }
  }
}
