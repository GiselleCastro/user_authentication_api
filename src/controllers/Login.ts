import type { FastifyRequest, FastifyReply } from "fastify";
import type { GenerateTokenService } from "../service/GenerateToken";
import { Login } from "../@types";
import { handlerErrorRequest } from "../utils/handlerErrorRequest";
import { BaseEntity } from "../config/BaseEntity";
import HttpStatusCode from "http-status-codes";

export class LoginController extends BaseEntity {
  constructor(private readonly generateTokenService: GenerateTokenService) {
    super();
  }
  handle = async (
    request: FastifyRequest<{
      Body: Login;
    }>,
    reply: FastifyReply,
  ) => {
    const { login, password } = request.body;

    try {
      const token = await this.generateTokenService.execute(login, password);
      return reply.code(HttpStatusCode.OK).send({ token });
    } catch (error) {
      handlerErrorRequest(error, this.logger, reply);
    }
  };
}
