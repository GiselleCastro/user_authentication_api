import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateUserService } from "../service/CreateUser";
import { BaseEntity } from "../config/BaseEntity";
import * as types from "../@types";
import HttpStatusCode from "http-status-codes";

export class CreateUserController extends BaseEntity {
  constructor(private readonly createUserService: CreateUserService) {
    super();
  }

  handler = async (
    request: FastifyRequest<{
      Body: types.CreateUser;
    }>,
    reply: FastifyReply,
  ) => {
    const { username, email, password, confirmPassword } = request.body;

    try {
      await this.createUserService.execute(
        username,
        email,
        password,
        confirmPassword,
      );
      return reply.code(HttpStatusCode.CREATED).send();
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
