import type { FastifyRequest, FastifyReply } from "fastify";
import type { InvalidateRefreshTokenService } from "../service/InvalidateRefreshToken";
import { Access, UUID } from "../@types";
import { BaseEntity } from "../config/BaseEntity";
import HttpStatusCode from "http-status-codes";

export class LogoutController extends BaseEntity {
  constructor(
    private readonly invalidateRefreshTokenService: InvalidateRefreshTokenService,
  ) {
    super();
  }
  handler = async (request: FastifyRequest & Access, reply: FastifyReply) => {
    const id = request?.access?.id as unknown as UUID;

    try {
      await this.invalidateRefreshTokenService.execute(id);
      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
