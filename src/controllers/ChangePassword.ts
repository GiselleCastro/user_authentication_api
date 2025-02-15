import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ChangePassowrdService } from '../service/ChangePassword';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class ChangePasswordController extends BaseEntity {
  constructor(private readonly changePassowrdService: ChangePassowrdService) {
    super();
  }

  handler = async (
    request: FastifyRequest<{
      Body: types.ChangePassword;
    }> &
      types.Access,
    reply: FastifyReply,
  ) => {
    const userId = request.access?.id as types.UUID;
    const { password, newPassword, confirmNewPassword } = request.body;

    try {
      await this.changePassowrdService.execute(
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
