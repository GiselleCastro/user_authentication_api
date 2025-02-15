import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ResetPasswordService } from '../service/ResetPassword';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class ResetPasswordController extends BaseEntity {
  constructor(private readonly resetPasswordService: ResetPasswordService) {
    super();
  }

  handler = async (
    request: FastifyRequest<{
      Body: types.NewPassword;
      Querystring: types.Token;
    }>,
    reply: FastifyReply,
  ) => {
    const { password, confirmPassword } = request.body;
    const { token } = request.query;

    try {
      await this.resetPasswordService.execute(token, password, confirmPassword);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply, { error });
    }
  };
}
