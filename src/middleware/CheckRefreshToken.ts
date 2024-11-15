import type { FastifyRequest, FastifyReply } from "fastify";
import { constants } from "../config/constants";
import { BadRequestError, BaseError } from "../config/BaseError";
import * as types from "../@types";
import { NO_TOKEN_ACCESS, INTERNAL_SERVER_ERROR } from "../utils/messages";
import { validationToken } from "../utils/validationToken";
import HttpStatusCode from "http-status-codes";

const { SECRET_REFRESH_TOKEN } = constants;

export class CheckRefreshTokenMiddleware {
  async handle(
    request: FastifyRequest<{
      Body: types.AccessTokenAndRefreshToken;
    }> &
      types.Access,
    reply: FastifyReply,
  ) {
    const refreshToken = request.body.refreshToken;
    if (!refreshToken) {
      const { code, ...infoError } = new BadRequestError(NO_TOKEN_ACCESS);
      return reply.status(code).send(infoError);
    }

    try {
      const decoded = (await validationToken(
        refreshToken,
        SECRET_REFRESH_TOKEN,
      )) as types.RefresTokenJSON;
      const access = { id: decoded.id };
      request.access = access;
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
