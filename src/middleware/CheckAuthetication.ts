import type { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { constants } from "../config/constants";
import { BadRequestError, UnauthorizedError } from "../config/BaseError";
import { TokenJSON, Access } from "../@types";
import {
  UNAUTHORIZATION,
  NO_TOKEN_ACCESS,
  INTERNAL_SERVER_ERROR,
} from "../utils/messages";
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
      const authorization = jwt.verify(token, SECRET_TOKEN_ACCESS) as TokenJSON;

      const access = authorization.app_metadata.authorization || {};
      access.userId = authorization.id;
      request.access = access;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const { code, ...infoError } = new UnauthorizedError(UNAUTHORIZATION);
        return reply.status(code).send(infoError);
      }
      return reply
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send({ message: INTERNAL_SERVER_ERROR });
    }
  }
}
