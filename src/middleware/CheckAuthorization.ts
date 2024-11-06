import type { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenError } from "../config/BaseError";
import { Access } from "../@types";
import { FORBIDDEN } from "../utils/messages";

export class CheckAuthorizationMiddleware {
  handle(permission: string) {
    return async (request: FastifyRequest & Access, reply: FastifyReply) => {
      if (request.access?.role !== "Role.ADMIN") {
        if (!request.access?.permissions?.includes(permission)) {
          const { code, ...infoError } = new ForbiddenError(FORBIDDEN);
          return reply.status(code).send(infoError);
        }
      }
    };
  }
}
