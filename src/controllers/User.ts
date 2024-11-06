import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserService } from "../service/User";
import { BaseEntity } from "../config/BaseEntity";
import * as types from "../@types";
import HttpStatusCode from "http-status-codes";

export class UserController extends BaseEntity {
  constructor(private readonly userService: UserService) {
    super();
  }

  createUser = async (
    request: FastifyRequest<{
      Body: types.CreateUser;
    }>,
    reply: FastifyReply,
  ) => {
    const { username, email, password, confirmPassword } = request.body;

    try {
      await this.userService.createUser(
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

  sendEmailToResetPassword = async (
    request: FastifyRequest<{
      Body: types.LoginToRecoverPassword;
    }>,
    reply: FastifyReply,
  ) => {
    const { login } = request.body;

    try {
      await this.userService.sendEmailToResetPassword(login);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply, { error });
    }
  };

  resetPassword = async (
    request: FastifyRequest<{
      Body: types.NewPassword;
      Querystring: types.Token;
    }>,
    reply: FastifyReply,
  ) => {
    const { password, confirmPassword } = request.body;
    const { token } = request.query;

    try {
      await this.userService.resetPassword(token, password, confirmPassword);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply, { error });
    }
  };

  confirmEmail = async (
    request: FastifyRequest<{
      Querystring: types.Token;
    }>,
    reply: FastifyReply,
  ) => {
    const { token } = request.query;

    try {
      await this.userService.confirmEmail(token);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };

  changePassword = async (
    request: FastifyRequest<{
      Body: types.ChangePassword;
    }> &
      types.Access,
    reply: FastifyReply,
  ) => {
    const userId = request.access?.userId as types.UUID;
    const { password, newPassword, confirmNewPassword } = request.body;

    try {
      await this.userService.changePassword(
        userId,
        password,
        newPassword,
        confirmNewPassword,
      );
      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply, { error });
    }
  };
}
